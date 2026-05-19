import { useState } from "react"
import api from '../../../utils/petsApi'
import { useNavigate, useParams } from "react-router-dom" 


export default function Groomer(){


    const [form, setForm] = useState({
        date: "",
        business_name: "",
        address: "",
        phone: "",
    })

    const [errorMessage, setErrorMessage] = useState('')

    const navigate = useNavigate()
    const {id} = useParams()

    // submit event handler
    const handleSubmit = async e => {   
        e.preventDefault()
        try {
            const token = localStorage.getItem('jwt')
            const options = {
                headers: {
                    'Authorization': token
                }
            }

            const response = await api.post('/api/appointments/', { ...form, pet: id }, options)
            console.log(response.data)
            console.log(form)
            navigate('/user/profile')
        } catch (err) {
            console.warn(err)
            if (err.response) {
                setErrorMessage(err.response.data.message)
            }
        }
    }
    return(
        <div>
        <h2 className="text-2xl">Groomer Visit</h2>
        <p>{errorMessage}</p>

        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='date'><h2>Date:</h2></label>
                <input 
                    type='text'
                    id='date'
                    value={form.date}
                    placeholder="What date was your visit?"
                    onChange={e => setForm ({ ...form, date: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor='business_name'><h2>Business name:</h2></label>
                <input 
                    type='text'
                    id='business_name'
                    value={form.business_name}
                    placeholder='Where is you pet getting groomed?'
                    onChange={e => setForm ({ ...form, business_name: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor='address'><h2>Address:</h2></label>
                <input 
                    type='text'
                    id='address'
                    value={form.address}
                    placeholder="groomer's address?"
                    onChange={e => setForm ({ ...form, address: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor='phone'><h2>Phone:</h2></label>
                <input 
                    type='text'
                    id='phone'
                    value={form.phone}
                    placeholder="Groomer's phone number?"
                    onChange={e => setForm ({ ...form, phone: e.target.value})}
                    />
            </div>

            <button type='submit'><h3>Add your appointment</h3></button>

        </form>
    </div>
    )
}