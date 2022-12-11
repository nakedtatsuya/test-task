import {RequestHandler} from "express";
import multer from "multer";
import {nanoid} from "nanoid";
import {join} from "path";

export const imageUploader = (
  name: string,
  imagePath: string
): RequestHandler => {
  const storage = multer.diskStorage({
    destination: join("public", imagePath),
    filename: (req, file, cb) => {
      const outFileName = `${nanoid()}.${file.mimetype.split("/")[1]}`;
      cb(null, outFileName);
    },
  });
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ACCEPTABLE_SUBTYPES = ["png", "jpeg"] as const;
      type AcceptableSubtype = typeof ACCEPTABLE_SUBTYPES[number];
      const toAcceptableImageMediaType = (
        fullMimeType: string
      ): ["image", AcceptableSubtype] | null => {
        const isAcceptableSubtype = (
          subtype: string
        ): subtype is AcceptableSubtype => {
          return (ACCEPTABLE_SUBTYPES as readonly string[]).includes(subtype);
        };
        const [mediaType, mediaSubtype] = fullMimeType.split("/");
        if (!mediaType || !mediaSubtype) return null;
        if (mediaType !== "image") return null;
        if (!isAcceptableSubtype(mediaSubtype)) return null;
        return ["image", mediaSubtype];
      };
      const mediaType = toAcceptableImageMediaType(file.mimetype);
      if (mediaType === null)
        return cb(
          new Error("Only image files in png or jpeg format can be uploaded")
        );
      cb(null, true);
    },
  });

  return (req, res, next) => {
    upload.single(name)(req, res, err => {
      if (err instanceof Error) {
        req.uploadError = {
          param: name,
          msg: err.message,
          location: "body",
          value: req.file,
        };
      }
      next();
    });
  };
};
