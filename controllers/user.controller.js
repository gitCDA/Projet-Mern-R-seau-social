const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

module.exports.getOneUserInfo = async (req, res) => {
    // params = URL, body = formulaire et model
    console.log(req.params);
    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const docs = await UserModel.findById(req.params.id)
        .select("-password");
        res.send(docs);
    } catch (err) {
        console.log("ID unknown : " + err);
    }
    // Callback deprecated
    // UserModel.findById(req.params.id, (err, docs) => {
    //     if (!err) res.send(docs);
    //     else console.log("ID unknown : " + err);
    // }).select("-password")
};

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    bio: req.body.bio,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true })
            .select("-password")
            .then((docs) => res.send(docs))
            .catch((err) => res.status(500).send({ err }));
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};


module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await UserModel.deleteOne({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Successfully deleted." });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.follow = async (req, res) => {
    if (
        !ObjectID.isValid(req.params.id) ||
        !ObjectID.isValid(req.body.idToFollow)
      )
    return res.status(400).send("ID unknown : " + req.params.id);

    try {
        // add to the follower list
        await UserModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true })
            .then((data) => res.status(201).send(data))
            .catch((err) => res.status(500).send({ message: err }))
            
        // add to following list
        await UserModel.findByIdAndUpdate(
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id } },
            { new: true, upsert: true })
            //don't send more than one response to the same request
            // .then((data) => res.send(data))
            .then(() => console.log('send2'))
            .catch((err) => res.status(500).send({ message: err }))
    } catch (err) {
      return res.status(500).json({ err });
    }
};

module.exports.unfollow = async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToUnfollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
        await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true })
          .then((data) => res.status(201).send(data))
          .catch((err) => res.status(500).send({ message: err }))
  
        // Retirer de la liste des followers
        await UserModel.findByIdAndUpdate(
          req.body.idToUnfollow,
          { $pull: { followers: req.params.id } },
          { new: true, upsert: true })
            .catch((err) => res.status(500).send({ message: err }))
    } catch (err) {
      return res.status(500).json({ err });
    }
}