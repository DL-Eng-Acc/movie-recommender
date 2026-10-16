import { useState } from "react";
import { apiFetch } from "../api"
import { useNavigate } from "react-router-dom";
import type { TmdbMovieDetails } from "../types/tmdb";
import "../styles/RandomButton.css"

export default function RandomButton() {
    const navigate = useNavigate();
    const [buttonName, setButtonName] = useState("Want a random movie?");
    const getRandom = async () => {
        try {
            setButtonName("Generating...")
            // The backend passes TMDB's movie details through unchanged
            const movieData = await apiFetch<Pick<TmdbMovieDetails, "id">>(
                "/movies/random",
            );
            setButtonName("Generated!")
            // causes redirect (go to movie page)
            void navigate(`/movie/${movieData.id}`)
        } catch (err: unknown) {
            console.log(err instanceof Error ? err.message : "Something went wrong with RandomButton.");
            setButtonName("Want a random movie?")
        }
    }

    return (
        <button type="button" onClick={() => void getRandom()} className="cursor-pointer text-sm" id="random-button">
            {buttonName}
        </button>
    )
}