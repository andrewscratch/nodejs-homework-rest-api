const express = require('express');
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");

const {User} = require("../../models/user");
const { authenticate, upload } = require("../../middlewares");
const ctrl = require("../../controllers/authAvatars")
const {schemas} = require("../../models/user");
const {RequestError, sendEmail} = require("../../helpers")
const {SECRET_KEY} = process.env;

const router = express.Router();

router.post("/register", async (req, res, next) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if(user) {
        throw RequestError(409, "email already in use")
    }
    try {
        const {error} = schemas.registerSchema.validate(req.body);
    
        if (error) {
          throw RequestError(400, error.message)
        }

      const hashPassword = await bcryptjs.hash(password, 10);
      const avatarURL = gravatar.url(email);
      const verificationCode = nanoid();

      const newUser = await User.create({
        ...req.body,
        password: hashPassword,
        avatarURL,
        verificationCode
      });

      await sendEmail(email, verificationCode);

        res.status(201).json({
            email: newUser.email,
            name: newUser.name,
            subscription: newUser.subscription,
        });
      } 
      catch (error) {
        next(error)
      }
});

router.get("/verify/:verificationCode", async (req, res, next) => {
try {
  const {verificationCode} = req.params;

  const user = await User.findOne({verificationCode});
  if (!user) {
    throw RequestError(401, "User not found")
  }

  await User.findOneAndUpdate(user._id, {verify: true, verificationCode: ""});

  res.json({
    message: "Verification successful"
  })
} catch (error) {
  next(error)
}
});

router.post("/verify", async (req, res, next) => {
  try {
  const {error} = schemas.emailSchema.validate(req.body);

    if (error) {
      throw RequestError(400, error.message)
    }

    const {email} = req.body;
    const user = await User.findOne({email});
    const verificationCode = user.verificationCode;
  
    if (!user) {
      throw RequestError(400, "missing required field email")
    }
    if (user.verify) {
      throw RequestError(400, "Verification has already been passed")
    }
  
    await sendEmail(email, verificationCode);

    res.json({
      message: "Verification email send success"
    })

  } catch (error) {
    next(error)
  }
})

router.post("/login", async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});

  if(!user) {
      throw RequestError(401, "Email or password is wrong")
  }
  try {
  const {error} = schemas.loginSchema.validate(req.body);
  
  if (error) {
      throw RequestError(400, error.message)
    }

const passwordCompare = await bcryptjs.compare(password, user.password);
if (!passwordCompare) {
  throw RequestError(401, "Email or password is wrong")
}

const payload = {
  id: user._id,
}
const {subscription} = user;
const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});
await User.findByIdAndUpdate(user._id, {token});

      res.status(200).json({
         token, 
         email,
         subscription,
      });
    } 

    catch (error) {
      next(error)
    }
});

router.post("/current", authenticate, async (req, res, next) => {
  try {
  const {email, name} = req.user;
  res.json({
    email, 
    name
  })

  } 
  catch (error) {
    next(error)
  }
})

router.post("/logout", authenticate, async (req, res, next) => {
  try {
    const {_id, email, subscription} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.json({
      email, 
      subscription, 
      message: "logout successfull",
    })
  
    } 
    catch (error) {
      next(error)
    }
})

router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;