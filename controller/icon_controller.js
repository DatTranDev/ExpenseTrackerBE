const Icon = require('../model/Icon.js');
const helper = require('../pkg/helper/helper.js');

const getAllIcons = async (req, res) => {
    const iconList = await Icon.find().catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        data: iconList
    })
}

const getIconById = async (req, res) => {
    const id = req.params.id;
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const existIcon = await Icon.findById(id)
    if(!existIcon) return res.status(404).json({
        message: "Icon is not found"
    })
    return res.json({
        data: existIcon
    })
}

module.exports = {getIconById, getAllIcons}