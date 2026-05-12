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
    static async getPetById(req, res) {
        const{id} = req.params

        if (!mongoose.Types.ObjectId.isValid(id))
        {
        return res.status(422).json({message: 'Id inválido!'})
        }
        const pet = await Pet.findById(id)

        if(!pet) 
        {
            return res.status(200).json({message:'Pet não encontrado'})
        }
        return res.status(200).json({pet})
    }
    async removePetById(req, res) {
        const { id } = req.params
      
     
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(422).json({ message: 'ID inválido!' })
        }
      
        const pet = await Pet.findById(id)
      
        if (!pet) {
          return res.status(404).json({ message: 'Pet não encontrado!' })
        }
      
       
        const token = getToken(req)
        const user = await getUserByToken(token)
      
        if (pet.user._id.toString() !== user._id.toString()) {
          return res.status(403).json({ message: 'Acesso negado! Você não é o dono deste pet.' })
        }
      
        await Pet.findByIdAndDelete(id)
      
        return res.status(200).json({ message: 'Pet removido com sucesso!' })
    }
    async updatePet (req,res)
    {
        const {id} = req.params
        const {name, age, weight, color} = req.body
        const images = req.files

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(422).json({ message: 'ID inválido!' })
          }
        
          const pet = await Pet.findById(id)
        
          if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado!' })
          }
        
          const token = getToken(req)
          const user = await getUserByToken(token)
        
          if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Acesso negado! Você não é o dono desse pet.' })
          }

          const updatedData = {}
        
          if (name) updatedData.name   = name
          if (age) updatedData.age    = age
          if (weight) updatedData.weight = weight
          if (color) updatedData.color  = color
        
          if (images && images.length > 0) {
            updatedData.images = images.map((image) => image.filename)
          }
        
          try {
            const updatedPet = await Pet.findByIdAndUpdate(id, updatedData, { new: true })
        
            return res.status(200).json({ message: 'Pet atualizado com sucesso!', updatedPet })
          } catch (error) {
            return res.status(500).json({ message: error.message })
          }
        }
    }
