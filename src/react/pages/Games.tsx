import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Games.css";

import downloadManager from "@bridge/download";
import gamesManager from "@bridge/games";
import GameCard from "@components/GameCard";
import Icon, { getIconByCaseInsensitiveName, Icons } from "@components/Icons";
import ToggleView from "@components/ToggleView";
import GameDetailsPage from "./GameDetailsPage";
import { CenteredLoading } from "./Loading";

import type { Game } from "@bridge/games";

type SortField = "name" | "lastUpdated" | "size" | "relevance";
type SortOrder = "asc" | "desc";

const Games: React.FC = () => {
  const [result, setResult] = useState<Game[]>(gamesManager.getCache());
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);
  const [isGrid, setIsGrid] = useState(true);
  const [showSort, setShowSort] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getAdbDevices = async () => {
    setLoading(true);

    setResult(await gamesManager.getGames());
    setLoading(false);
  };

  useEffect(() => {
    void getAdbDevices();
  }, []);

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const filteredAndSortedResults = sortGames(
    result
      .filter(item => {
        if (!search) return true;
        const match = searchItemIsIncluded(search, item);
        return match.relevance > 0;
      })
      .map(item => ({
        relevance: search ? searchItemIsIncluded(search, item).relevance : 0,
        game: item,
      })),
    sortField,
    sortOrder
  );
  if (result.length > 0 && id) {
    return <GameDetailsPage game={result.find(game => game.id === id)!} />;
  }

  return (
    <>
      <div className="game-list-header">
        <Icon icon={Icons.solid.faSearch} size="xl" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
          placeholder="Search"
        />
        <CenteredLoading visible={result.length === 0 || loading} />
        <ToggleView onToggle={setIsGrid} />
        <strong>Limit:</strong>
        <select onChange={e => setLimit(Number.parseInt(e.target.value))} value={`${limit}`}>
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="250">250</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
          <option value="10000">All (Not Recomended)</option>
        </select>
        <button className="dropdown-toggle" type="button" onClick={() => setShowSort(!showSort)}>
          {getSortIcon(sortField, sortOrder)}{" "}
          <Icon
            className="dropdown-icon"
            icon={getIconByCaseInsensitiveName("chevron-down")}
            size="xs"
          />
          {showSort && (
            <>
              <div id="sortdropdown" className="dropdown-menu">
                <a
                  className="dropdown-item"
                  onClick={() => {
                    handleSort("name", "asc");
                  }}
                >
                  {getSortIcon("name", "asc")}
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    handleSort("name", "desc");
                  }}
                >
                  {getSortIcon("name", "desc")}
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    handleSort("size", "asc");
                  }}
                >
                  {getSortIcon("size", "asc")}
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    handleSort("size", "desc");
                  }}
                >
                  {getSortIcon("size", "desc")}
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    handleSort("lastUpdated", "asc");
                  }}
                >
                  {getSortIcon("lastUpdated", "asc")}
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    handleSort("lastUpdated", "desc");
                  }}
                >
                  {getSortIcon("lastUpdated", "desc")}
                </a>
              </div>
            </>
          )}
        </button>
      </div>
      <div className={"game-list" + (isGrid ? "" : " list")}>
        {filteredAndSortedResults
          .filter((_, i) => i < limit)
          .map(item => item.game)
          .map(game => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={game => void navigate(game.id ?? "")}
              onDownload={() => downloadManager.downloadGame(game.id)}
            />
          ))}
      </div>
    </>
  );
};

export default Games;

interface SearchRelevance {
  relevance: number;
  game: Game;
}

const fieldToSearch: (keyof Game)[] = [
  "id",
  "category",
  "name",

  "normalName",
  "packageName",
  "version",
];

function searchItemIsIncluded(search: string, item: Game): SearchRelevance {
  search = search.trim().toLowerCase();
  const searchParts = search.split(" ");
  let relevance = 0;

  fieldToSearch.forEach(field => {
    const fieldValue = item[field];
    if (typeof fieldValue !== "string") return;
    const fieldParts = fieldValue.toLocaleLowerCase().split(" ");
    const fieldRelevance = searchParts.reduce((acc, searchPart) => {
      return (
        acc +
        fieldParts.reduce((acc, fieldPart) => {
          return acc + (fieldPart.includes(searchPart) ? 1 : 0);
        }, 0)
      );
    }, 0);
    relevance += fieldRelevance;
  });

  return { relevance, game: item };
}

function sortGames(games: SearchRelevance[], field: SortField, order: SortOrder) {
  return [...games].sort((a, b) => {
    // Special case for relevance since it's not a direct property of Game
    if (field === "relevance") {
      return order === "asc" ? a.relevance - b.relevance : b.relevance - a.relevance;
    }

    const aValue = a.game[field];
    const bValue = b.game[field];

    if (aValue === bValue) return 0;

    const comparison = aValue! < bValue! ? -1 : 1;
    return order === "asc" ? comparison : -comparison;
  });
}

function getSortIcon(field: SortField, order: SortOrder) {
  switch (field) {
    case "name":
      return (
        <>
          <Icon
            className="dropdown-icon"
            icon={getIconByCaseInsensitiveName(`sort-alpha-${order}`)}
            size="1x"
          />
          {order === "asc" ? "Name" : "Name (decending)"}
        </>
      );
    case "size":
      return (
        <>
          <Icon
            className="dropdown-icon"
            icon={getIconByCaseInsensitiveName(`sort-amount-${order}`)}
            size="1x"
          />
          {order === "asc" ? "Size" : "Size (decending)"}
        </>
      );
    case "lastUpdated":
      return (
        <>
          <Icon
            className="dropdown-icon"
            icon={getIconByCaseInsensitiveName(`sort-amount-${order}`)}
            size="1x"
          />
          {order === "asc" ? "Last Updated" : "Last Updated (decending)"}
        </>
      );
    default:
      return null;
  }
}
