const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp")
const {User} = require("../models/user");
const {ctrlWrapper} =require("../helpers")

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const updateAvatar = async (req, res, next) => {
     const {_id} = req.user;
  const { path: tempUpload, originalname } = req.file;

  const avatar = await jimp.read(tempUpload);
  avatar.cover(250, 250)
  await avatar.writeAsync(tempUpload);

  const fileName = `${_id}_${originalname}`;

  const resultUpload = path.join(avatarsDir, fileName);

  await fs.rename(tempUpload, resultUpload);
  
  const avatarURL = path.join("avatars", fileName);
  await User.findByIdAndUpdate(_id, {avatarURL});
  
  res.json({ avatarURL})

    }
    

    module.exports = {
        updateAvatar: ctrlWrapper(updateAvatar),
    };