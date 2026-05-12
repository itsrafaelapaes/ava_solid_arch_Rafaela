const Pet = require('../models/Pet')
const getUserByToken= require('../helpers/get-user-by-token')
const getToken= require('../helpers/get-token')

module.exports = class PetController {

    static async create(req, res) {
        const {name, age, weight, color} = req.body
        const images = req.files


        if(!name) {
            return res.status(422).json({message:'O nome é obriga´tório'})
        }
        if (!age){
            return res.status(422).json({message:'A idade é obrigatória'})
        }
        if (weight) {
            return res.status(422).json({message:'O peso é obrigatório'})
        }
        if (!color) {
            return res.status(422).json({message:'A cor é obrigatória'})
        }
        if (images || images.length === 0) {
            return res.status(422).json({message:'Ao menos uma imagem é obrigatória'})
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        const imageFiles= images.map((image => image.filename))

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            images: imageFiles,
            available: true,
            user:{
                _id:user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })
        try {
            const newPet = await pet.save()
            return res(201).json({
                message: 'Pet cadastrado com sucesso!',
                newPet
            })
        } catch (error){
            return res.status(500).json({message: error.message})
        }
    }

    static async getAll(req, res)
    {
        const pets = await Pet.find().sort('-createdAdt')

        return res.status(200).json({pets})
    }
    static async getAllUserPets(req,res)
    {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')

        return res.status(200).json({pets})
    }
    static async getAllUserAdoptions(req, res)
    {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id':user._id}).sort('-createdAt')

        return res.status(200).json({pets})
    }

}