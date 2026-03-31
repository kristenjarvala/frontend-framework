/**
 * A simple HTTP class for making HTTP requests.
 * Makes it simpler 
 */

export class Http {
    //GET request
    async get(url) {
        const response = await fetch(url);
        return this.#handleResponse(response);
    }

    //POST request
    async post(url, data) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return this.#handleResponse(response);
    }

    //PUT request
    async put(url, data) {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return this.#handleResponse(response);
    }

    //DELETE request
    async delete(url) {
        const response = await fetch(url, {
            method: "DELETE"
        });
        return this.#handleResponse(response);
    }

    //Handle the response from the given request.
    //If the response is not ok, throw an error.
    //If the response is ok, return the response as json.
    async #handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }
}

export const http = new Http();