import express from "express";
import {imageUploader} from "@/middlewares/uploader";
import {User} from "@/models/user";
import {
  isUniqueEmail,
  ensureAuthUser,
  forbidAuthUser,
} from "@/middlewares/authentication";
import {ensureCorrectUser} from "@/middlewares/current_user";
import {body, validationResult} from "express-validator";
import {HashPassword} from "@/lib/hash_password";

export const userRouter = express.Router();

/** A page to list all users */
userRouter.get("/", ensureAuthUser, async (req, res) => {
  const users = await User.all();
  res.render("users/index", {
    users,
  });
});

/** An endpoint to create a new user */
userRouter.post(
  "/",
  forbidAuthUser,
  body("name", "Name can't be blank").notEmpty(),
  body("email", "Email can't be blank").notEmpty(),
  body("password", "Password can't be blank").notEmpty(),
  body("email").custom(isUniqueEmail),
  async (req, res) => {
    const {name, email, password} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("users/new", {
        user: {
          name,
          email,
          password,
        },
        errors: errors.array(),
      });
    }
    const hashPassword = await new HashPassword().generate(password);
    const user = new User(name, email, hashPassword);
    await user.save();

    req.authentication?.signin(user);
    req.dialogMessage?.setMessage("You have signed up successfully");
    res.redirect(`/users/${user.id}`);
  }
);

/** A page to show user details */
userRouter.get("/:userId", ensureAuthUser, async (req, res, next) => {
  const {userId} = req.params;
  const user = await User.find(Number(userId));
  if (!user) return next(new Error("Invalid error: The user is undefined."));
  const posts = await user.posts();
  const postsWithUser = await Promise.all(
    posts.map(async post => {
      const user = await post.user();
      return {
        ...post,
        user,
      };
    })
  );
  res.render("users/show", {
    user,
    posts: postsWithUser,
    activeTab: "posts",
  });
});

/** A page to list all tweets liked by a user */
userRouter.get("/:userId/likes", ensureAuthUser, async (req, res, next) => {
  const {userId} = req.params;
  const user = await User.find(Number(userId));
  if (!user) return next(new Error("Invalid error: The user is undefined."));
  const posts = await user.likedPosts();
  const postsWithUser = await Promise.all(
    posts.map(async post => {
      const user = await post.user();
      return {
        ...post,
        user,
      };
    })
  );
  res.render("users/show", {
    user,
    posts: postsWithUser,
    activeTab: "likes",
  });
});

/** A page to edit a user */
userRouter.get(
  "/:userId/edit",
  ensureAuthUser,
  ensureCorrectUser,
  async (req, res) => {
    const {userId} = req.params;
    const user = await User.find(Number(userId));
    res.render("users/edit", {
      user,
      errors: [],
    });
  }
);

/** An endpoint to update a user */
userRouter.patch(
  "/:userId",
  ensureAuthUser,
  ensureCorrectUser,
  imageUploader("image", "image/users"),
  body("name", "Name can't be blank").notEmpty(),
  body("email", "Email can't be blank").notEmpty(),
  async (req, res, next) => {
    const {userId} = req.params;
    const {name, email} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty() || req.uploadError) {
      const validationErrors = errors.array();
      if (req.uploadError) {
        validationErrors.push(req.uploadError);
      }
      return res.render("users/edit", {
        user: {
          id: userId,
          name,
          email,
        },
        errors: validationErrors,
      });
    }

    const user = await User.find(Number(userId));
    if (!user) return next(new Error("Invalid error: The user is undefined."));
    Object.assign(user, {name, email});
    if (req.file) {
      user.imageName = req.file.path.replace("public", "");
    } else {
      console.log("no file");
    }

    await user.update();
    req.dialogMessage?.setMessage("Your account has been updated successfully");
    res.redirect(`/users/${user.id}`);
  }
);
