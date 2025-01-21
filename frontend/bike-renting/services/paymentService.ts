import axios from 'axios';

export const addBalance = async ( amount : number, userToken :string | null) => {
    const response = await axios.post(
        'http://92.100.188.183:24120/islabFirst-0.1/api/payment',
        {
            amount: amount,
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};
