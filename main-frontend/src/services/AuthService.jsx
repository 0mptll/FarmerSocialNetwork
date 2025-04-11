import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

export const login = async (email, password, role) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: email,
            password: password,
            role: role,
        });
        const userr = response.data;
        if (userr) {
            localStorage.setItem("username", email);
            localStorage.setItem("password", password);
            return userr;
        } else {
            throw new Error('Invalid credentials or role');
        }
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const register = async (userData) => {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role);
    formData.append('location', userData.location);
    formData.append('contactInfo', userData.contactInfo);
    formData.append('dateOfJoining', userData.dateOfJoining);

    //for mongodb user registration 

    const formDataToSend = new FormData();
    formDataToSend.append('username',  userData.name);
    formDataToSend.append('email', userData.email);
    formDataToSend.append('phoneNo', userData.contactInfo);
    formDataToSend.append('password', userData.password);
    formDataToSend.append('language', "English");
    formDataToSend.append('bio', " ");

    if (userData.profileImage) {
        formData.append('profileImage', userData.profileImage);
        formDataToSend.append('profilePicture', userData.profileImage);
    }

    try {
        const response = await axios.post(`${BASE_URL}/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        const response1 = await axios.post(`http://localhost:5000/api/user/signup`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (err) {
        throw new Error(err.response ? err.response.data : 'Error during registration');
    }
    
    
};

