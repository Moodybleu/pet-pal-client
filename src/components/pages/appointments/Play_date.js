import { useState } from "react"
import api from '../../../utils/petsApi'
import { useNavigate, useParams } from "react-router-dom" 


export default function Groomer(){


    const [form, setForm] = useState({
        day: "",
        place: "",
        date: "",
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
        <h2 className="text-2xl">Play Date Planner</h2>
        <p>{errorMessage}</p>

        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='day'><h2>Day:</h2></label>
                <input 
                    type='text'
                    id='day'
                    value={form.day}
                    placeholder="What day is your date?"
                    onChange={e => setForm ({ ...form, day: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor='place'><h2>Location:</h2></label>
                <input 
                    type='text'
                    id='place'
                    value={form.place}
                    placeholder='Where is your pets date?'
                    onChange={e => setForm ({ ...form, place: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor='date'><h2>Date:</h2></label>
                <input 
                    type='text'
                    id='date'
                    value={form.date}
                    placeholder="Who's your furry friends date?"
                    onChange={e => setForm ({ ...form, date: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor='phone'><h2>Phone:</h2></label>
                <input 
                    type='text'
                    id='phone'
                    value={form.phone}
                    placeholder="What is your date's phone number?"
                    onChange={e => setForm ({ ...form, phone: e.target.value})}
                    />
            </div>

            <button type='submit'><h3>Add your play date</h3></button>

        </form>
    </div>
    )
}