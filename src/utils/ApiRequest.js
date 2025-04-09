import axios from "axios";

export default async function apiRequest(url,method='GET',headers={},body=null){
    try{
        const response = await axios({
            url,
            method,
            headers,
            data:body
        });
 

        return{
            resStatus : true,
            error : null,
            data : response.data
        };
    }catch(error){
        return{
            resStatus: false,
            error: error.response ? error.response.data : "Server Error",
            data: null,
        }
    }
}