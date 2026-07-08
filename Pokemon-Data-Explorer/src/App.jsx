import { useState, useEffect } from "react";
import './App.css'

export default function App() {
  const [pokemon, setPokemon] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(500);

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

  // Calculate max weight for slider
  const maxPokemonWeight =
    pokemon.length > 0
      ? Math.max(...pokemon.map((poke) => poke.weight))
      : 500;

  // Filter pokemon based on search input, type, and weight bounds
  const filteredPokemon = pokemon.filter((poke) => {
    const matchesSearch = poke.name
      .toLowerCase()
      .includes(searchInput.toLowerCase());

    const matchesType =
      typeFilter === "all" || poke.type === typeFilter;

    const matchesWeight = poke.weight >= minWeight && poke.weight <= maxWeight;

    return matchesSearch && matchesType && matchesWeight;
  });

  return (
    <>
      <h1>Pokemon Data Explorer</h1>

      <div className="statistics">
        <h2>Total Pokemon: {totalPokemon}</h2>
        <h2>Average Weight: {averageWeight}</h2>
        <h2>Tallest Pokemon: {tallestPokemon?.name}</h2>
      </div>

      <input
        type="text"
        placeholder="Search Pokemon..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="grass">Grass</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="electric">Electric</option>
      </select>

      <div className="weight-filter">
        <label>
          Min Weight: {minWeight}
          <input
            type="range"
            min="0"
            max={maxPokemonWeight}
            value={minWeight}
            onChange={(e) => setMinWeight(Number(e.target.value))}
          />
        </label>
        <label>
          Max Weight: {maxWeight}
          <input
            type="range"
            min="0"
            max={maxPokemonWeight}
            value={maxWeight}
            onChange={(e) => setMaxWeight(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="pokemon-list">
        {filteredPokemon.map((poke) => (
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
