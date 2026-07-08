import { useState, useEffect } from "react";
import './App.css'

export default function App() {
  const [pokemon, setPokemon] = useState([]);

  useEffect(() => {
    const fetchPokemon = async () => {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20"
      );

      const data = await response.json();

      const detailedPokemon = await Promise.all(
        data.results.map(async (item) => {
          const response = await fetch(item.url);
          const details = await response.json();

          return {
            name: details.name,
            height: details.height,
            weight: details.weight,
            type: details.types[0].type.name,
            image: details.sprites.front_default,
          };
        })
      );

      setPokemon(detailedPokemon);
    };

    fetchPokemon();
  }, []);

  // Calculate statistics
  const totalPokemon = pokemon.length;
  const averageWeight =
    pokemon.length > 0
      ? (
          pokemon.reduce((sum, poke) => sum + poke.weight, 0) /
          pokemon.length
        ).toFixed(1)
      : 0;
  const tallestPokemon =
    pokemon.length > 0
      ? pokemon.reduce((tallest, poke) =>
          poke.height > tallest.height ? poke : tallest
        )
      : null;

  return (
    <>
      <h1>Pokemon Data Explorer</h1>

      <div className="statistics">
        <h2>Total Pokemon: {totalPokemon}</h2>
        <h2>Average Weight: {averageWeight}</h2>
        <h2>Tallest Pokemon: {tallestPokemon?.name}</h2>
      </div>

      <div className="pokemon-list">
        {pokemon.map((poke) => (
          <div key={poke.name}>
            <img src={poke.image} alt={poke.name} />
            <h3>{poke.name}</h3>
            <p>Type: {poke.type}</p>
            <p>Weight: {poke.weight}</p>
          </div>
        ))}
      </div>
    </>
  );
}