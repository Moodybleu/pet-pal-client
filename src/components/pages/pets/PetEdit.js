import { useEffect, useState, useParams } from "react"
import api from '../../../utils/petsApi'
import { useNavigate } from "react-router-dom"

export default function PetEdit(){

    const [form, setForm] = useState({
        Name: '',
        Breed: '',
        date_of_birth: '',
        Nickname: '',
        Catchphrase: ''
    })

    const token = localStorage.getItem('jwt')
    const options = {
        headers: {
            'Authorization': token
        }
    }
    console.log(options)
    const [errorMessage, setErrorMessage] = useState('')

    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const getPet = async () => {
        try {
            console.log(id)
            const response = await api.get(`/api/pet/${id}/`, options)
            const pet = response.data.pet.filter(pet => pet._id === id)
            console.log(pet)
            console.log(pet[0].content)
            setForm({Name: pet[0].Name, Breed: pet[0].Breed, Date_of_birth: pet[0].Date_of_birth, Nickname: pet[0].Nickname, Catchphrase: pet[0].Catchphrase})
        } catch (err) {
            console.warn(err)
            if(err.response) {
                setErrorMessage(err.response.data.message)
            }
        }
    }
    getPet()
}, [])
    
const handleSubmit = async e => {
    e.preventDefault()
    try {

        const response = await api.put(`/api/pet/${id}/`, form, options)
        navigate("/user/profile/")
    } catch(err) {
        console.warn(err)
        if(err.response){
            setErrorMessage(err.response.data.message)
        }
    }
}

const handleDelete = async e => {
    e.preventDefault()
    try {
        console.log(options)
        const response = await api.delete(`/api/pet/${id}/`, options)
        navigate("/user/profile")
    } catch(err) {
        console.warn(err)
        if(err.response){
            setErrorMessage(err.response.data.message)
        }
    }
}
    return(
        <div>
            <h2>Need to add a new pet? </h2>
            <p>{errorMessage}</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='Name'><h2>Name:</h2></label>
                    <input 
                        type='text'
                        id='Name'
                        value={form.Name}
                        // placeholder="What's your pet's name?"
                        onChange={e => setForm ({ ...form, Name: e.target.value})}
                        />
                </div>
                <div>
                    <label htmlFor='Breed'><h2>Breed:</h2></label>
                    <input 
                        type='text'
                        id='Breed'
                        value={form.Breed}
                        // placeholder='What breed is your pet?'
                        onChange={e => setForm ({ ...form, Breed: e.target.value})}
                        />
                </div>
                <div>
                    <label htmlFor='date_of_birth'><h2>Date of birth/adoption:</h2></label>
                    <input 
                        type='text'
                        id='date_of_birth'
                        value={form.date_of_birth}
                        // placeholder='When was your pet born or adopted?'
                        onChange={e => setForm ({ ...form, date_of_birth: e.target.value})}
                        />
                </div>
                <div>
                    <label htmlFor='Nickname'><h2>Nickname:</h2></label>
                    <input 
                        type='text'
                        id='Nickname'
                        value={form.Nickname}
                        // placeholder='Does your pet have a nickname?'
                        onChange={e => setForm ({ ...form, Nickname: e.target.value})}
                        />
                </div>
                <div>
                    <label htmlFor='Catchphrase'><h2>Catchphrase:</h2></label>
                    <input 
                        type='text'
                        id='Catchphrase'
                        value={form.Catchphrase}
                        // placeholder='When was your pet born or adopted?'
                        onChange={e => setForm ({ ...form, Catchphrase: e.target.value})}
                        />
                </div>

                <button type='submit'><h3>Submit changes</h3></button>

            </form>
                <form onSubmit={handleDelete}>

                <button type='submit'><h2>Remove pet</h2></button>

            </form>
        </div>
    )
}    