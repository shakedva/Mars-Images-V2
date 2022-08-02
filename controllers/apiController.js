const db = require('../models');

exports.postSearchEmail = (req,res) => {
    return db.User.findOne({where: {email: req.params.email}})
        .then((user) => res.json(user))
        .catch((err) =>
        {
            return res.send("error");
        });
};

exports.postAddImage = (req,res) => {
    if (req.session.logged === true)
    {
        let data = req.body;
        let email, url, sol, earthDate, imageId, mission, camera;
        [email, url, sol, earthDate, imageId, mission, camera] = [
            req.session.email, data.url, data.sol, data.earthDate, data.imageId, data.mission, data.camera];
        return db.MarsImage.findOrCreate({
                where: {
                    imageId: imageId,
                    url: url,
                    sol: sol,
                    earthDate: earthDate,
                    email: email,
                    camera: camera,
                    mission: mission
                }
            }
        ).spread((img, created) => // created represent if the database created a new record or if it was already existed
        {
            res.json({image: created});
        }).catch((err) =>
        {
            return res.json({image: false});
        });
    }
    else
        res.json({image: "not logged"});
};

exports.getImages = (req,res) => {
    if (req.session.logged === true)
    {
        let email = req.session.email;
        return db.MarsImage.findAll({
            where: {email: email}
        })
            .then((record) => res.send(record))
            .catch((err) =>
            {
                return res.send("error");
            });
    }
    else
        return res.send("not logged");
};

exports.deleteAnImage = (req,res) => {
    if (req.session.logged === true)
    {
        const id = parseInt(req.params.id);
        return db.MarsImage.findOne({where: {imageId: id,email: req.session.email}})
            .then((image) => image.destroy({force: true}))
            .then(() => res.json({delete: true}))
            .catch((err) =>
            {
                res.json({delete: false});
            })
    }
    else
        res.json({delete: "not logged"});
};

exports.deleteAllImages = (req,res) => {
    if (req.session.logged === true)
    {
        return db.MarsImage.findAll({where: {email: req.session.email}})
            .then((image) =>
            {
                for (let u of image)
                    u.destroy();
                res.json({delete: true});
            })
            .catch((err) =>
            {
                res.json({delete: false});
            });
    }
    else
        res.json({delete: "not logged"});
};

