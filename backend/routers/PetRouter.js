const router = require('express').Router()

const verifyToken = require('../middlewares/verify-token')
const imageUpload = require('../middlewares/image-upload')

const PetController = require('../controllers/PetController')

router.get('/', PetController.getAll)
router.get('/:id', PetController.getPetById)

router.post('/', verifyToken, imageUpload.array('images'), PetController.create)
router.patch('/:id', verifyToken, imageUpload.array('images'), PetController.updatePet)
router.delete('/:id', verifyToken, PetController.removePetById)

router.patch('/schedule/:id', verifyToken, PetController.schedule)
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption)

router.get('/mypets/user', verifyToken, PetController.getAllUserPets)
router.get('/myadoptions/user', verifyToken, PetController.getAllUserAdoptions)

module.exports = router