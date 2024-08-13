import axios from "axios";


export const getTask = () => {
    return axios.get("https://reactganttbackend.onrender.com/tasks")
}