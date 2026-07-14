import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PokemonList() {
  const [pokemon, setPokemon] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(500);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=20"
        );

        if (!response.ok) {
          throw new Error("Unable to load Pokémon right now.");
        }

        const data = await response.json();

        const detailedPokemon = await Promise.all(
          data.results.map(async (item) => {
            const response = await fetch(item.url);

            if (!response.ok) {
              throw new Error(`Failed to load details for ${item.name}.`);
            }

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
      } catch (error) {
        setPokemon([]);
        setError(error.message || "Something went wrong while loading Pokémon.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, []);

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

  // Calculate statistics from the visible list so the summary matches the cards on screen.
  const totalPokemon = filteredPokemon.length;
  const averageWeight =
    filteredPokemon.length > 0
      ? (
          filteredPokemon.reduce((sum, poke) => sum + poke.weight, 0) /
          filteredPokemon.length
        ).toFixed(1)
      : 0;
  const tallestPokemon =
    filteredPokemon.length > 0
      ? filteredPokemon.reduce((tallest, poke) =>
          poke.height > tallest.height ? poke : tallest
        )
      : null;

  // Calculate max weight for slider
  const maxPokemonWeight =
    pokemon.length > 0
      ? Math.max(...pokemon.map((poke) => poke.weight))
      : 500;

  // Chart 1: how many of the visible Pokemon fall into each type
  const typeCounts = filteredPokemon.reduce((counts, poke) => {
    counts[poke.type] = (counts[poke.type] || 0) + 1;
    return counts;
  }, {});
  const typeCountData = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  // Chart 2: how average weight differs across those same types
  const weightTotalsByType = filteredPokemon.reduce((totals, poke) => {
    if (!totals[poke.type]) {
      totals[poke.type] = { sum: 0, count: 0 };
    }
    totals[poke.type].sum += poke.weight;
    totals[poke.type].count += 1;
    return totals;
  }, {});
  const avgWeightData = Object.entries(weightTotalsByType).map(
    ([type, { sum, count }]) => ({
      type,
      avgWeight: Number((sum / count).toFixed(1)),
    })
  );

  return (
    <>
      <h1>Pokemon Data Explorer</h1>

      {error && <p className="error-banner">{error}</p>}
      {isLoading && <p className="loading-banner">Loading Pokémon data...</p>}

      <div className="statistics">
        <h2>Matching Pokemon: {totalPokemon}</h2>
        <h2>Average Weight: {averageWeight}</h2>
        <h2>Tallest Pokemon: {tallestPokemon?.name}</h2>
      </div>

      <div className="charts">
        <div className="chart-card">
          <h3>Pokémon Count by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeCountData} barCategoryGap="25%">
              <CartesianGrid stroke="#e1e0d9" vertical={false} />
              <XAxis
                dataKey="type"
                tick={{ fill: "#898781", fontSize: 12 }}
                axisLine={{ stroke: "#c3c2b7" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#898781", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(42, 120, 214, 0.08)" }}
                contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9" }}
              />
              <Bar
                dataKey="count"
                name="Pokémon"
                fill="#2a78d6"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Average Weight by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={avgWeightData} barCategoryGap="25%">
              <CartesianGrid stroke="#e1e0d9" vertical={false} />
              <XAxis
                dataKey="type"
                tick={{ fill: "#898781", fontSize: 12 }}
                axisLine={{ stroke: "#c3c2b7" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#898781", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(42, 120, 214, 0.08)" }}
                contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9" }}
              />
              <Bar
                dataKey="avgWeight"
                name="Avg Weight"
                fill="#2a78d6"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
          <Link key={poke.name} to={`/pokemon/${poke.name}`} className="pokemon-card">
            <img src={poke.image} alt={poke.name} />
            <h3>{poke.name}</h3>
            <p>Type: {poke.type}</p>
            <p>Weight: {poke.weight}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
