import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function PokemonDetail() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

        if (!response.ok) {
          throw new Error(`Unable to load details for ${name}.`);
        }

        const data = await response.json();

        setPokemon({
          name: data.name,
          height: data.height,
          weight: data.weight,
          image: data.sprites.front_default,
          types: data.types.map((t) => t.type.name),
          abilities: data.abilities.map((a) => a.ability.name),
          stats: data.stats.map((s) => ({
            name: s.stat.name,
            value: s.base_stat,
          })),
        });
      } catch (error) {
        setPokemon(null);
        setError(
          error.message || "Something went wrong while loading this Pokémon."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [name]);

  return (
    <div className="pokemon-detail">
      <Link to="/" className="back-link">
        ← Back to Dashboard
      </Link>

      {error && <p className="error-banner">{error}</p>}
      {isLoading && <p className="loading-banner">Loading Pokémon details...</p>}

      {pokemon && (
        <>
          <h1>{pokemon.name}</h1>
          <img src={pokemon.image} alt={pokemon.name} />
          <p>Height: {pokemon.height}</p>
          <p>Weight: {pokemon.weight}</p>
          <p>Type(s): {pokemon.types.join(", ")}</p>
          <p>Abilities: {pokemon.abilities.join(", ")}</p>

          <h3>Base Stats</h3>
          <ul>
            {pokemon.stats.map((stat) => (
              <li key={stat.name}>
                {stat.name}: {stat.value}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
