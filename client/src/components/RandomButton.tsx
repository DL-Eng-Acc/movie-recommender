import { useState } from "react";
import { apiFetch } from "../api"
import { useNavigate } from "react-router-dom";
import "../styles/RandomButton.css"

export default function RandomButton() {
    const navigate = useNavigate();
    const [buttonName, setButtonName] = useState("Want a random movie?");
    const getRandom = async () => {
        try {
            setButtonName("Generating...")
            const movieData = await apiFetch<{ id: string }>("/movies/random");
            setButtonName("Generated!")
            // causes redirect (go to movie page)
            navigate(`/movie/${movieData.id}`)
        } catch (err: unknown) {
            console.log(err instanceof Error ? err.message : "Something went wrong with RandomButton.");
            setButtonName("Want a random movie?")
        }
    }

    return (
        <button type="button" onClick={getRandom} className="cursor-pointer text-sm" id="random-button">
            {buttonName}
        </button>
    )
}