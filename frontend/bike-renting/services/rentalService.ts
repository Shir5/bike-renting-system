// services/rentalService.ts

const API_BASE_URL = 'http://178.69.216.14:24120/islabFirst-0.1/api'; // Replace with your actual backend URL

/**
 * Creates a new rental by calling the backend.
 *
 * @param userToken - The user's authentication token.
 * @param userId - The ID of the user renting the bicycle.
 * @param bicycleId - The ID of the bicycle to be rented.
 * @param startStationId - The ID of the station where the rental starts.
 * @returns A promise resolving to the created rental data.
 */export async function createRental(
    userToken: string,
    userId: number,
    bicycleId: number,
    startStationId: number
): Promise<any> {
    const requestBody = {
        user_id: userId,
        bicycle_id: bicycleId,
        start_station_id: startStationId,
    };

    try {
        console.log("Creating rental with request body:", requestBody);
        const response = await fetch(`${API_BASE_URL}/rental`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error creating rental, status:", response.status, "response:", errorText);
            throw new Error('Ошибка создания аренды');
        }

        const rentalData = await response.json();
        console.log("Rental created successfully:", rentalData);
        return rentalData;
    } catch (error: any) {
        console.error("Exception in createRental:", error.message);
        throw error;
    }
}


/**
 * Updates an existing rental to stop it by calling the backend.
 *
 * @param userToken - The user's authentication token.
 * @param rentalId - The ID of the rental to update.
 * @param endStationId - The ID of the station where the rental ends.
 * @returns A promise resolving to the updated rental data.
 */
export async function updateRental(
    userToken: string,
    rentalId: number,
    endStationId: number
): Promise<any> {
    const requestBody = {
        end_station_id: endStationId,
        // Optionally, include the bicycle id if required:
        // bicycle_id: <bicycleId>,
    };

    try {
        console.log(`Updating rental ${rentalId} with request body:`, requestBody);
        const response = await fetch(`${API_BASE_URL}/rental/${rentalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error updating rental, status:", response.status, "response:", errorText);
            throw new Error('Ошибка завершения аренды');
        }

        const updatedRental = await response.json();
        console.log("Rental updated:", updatedRental);
        return updatedRental;
    } catch (error: any) {
        console.error("Exception in updateRental:", error.message);
        throw error;
    }
}
