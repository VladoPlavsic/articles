defmodule Articles.Reader do
  @articles_dir Path.join(:code.priv_dir(:articles), "/articles")

  def list_articles do
    case File.ls(@articles_dir) do
      {:ok, files} ->
        files
        |> Enum.filter(&String.ends_with?(&1, ".json"))
        |> Enum.map(&read_article/1)
        |> Enum.filter(&match?({:ok, _}, &1))
        |> Enum.map(fn {:ok, article} -> article end)
        |> Enum.sort_by(& &1["id"])

      {:error, reason} ->
        IO.warn("Failed to read articles directory: #{reason}")
        []
    end
  end

  def list_article_title_id_pairs do
    list_articles()
    |> Enum.map(&Map.take(&1, ["id", "title", "subtitle"]))
  end

  def find_article(article_id) do
    list_articles()
    |> Enum.find(&(&1["id"] == article_id))
  end

  defp read_article(filename) do
    filepath = Path.join(@articles_dir, filename)

    case File.read(filepath) do
      {:ok, contents} ->
        case Jason.decode(contents) do
          {:ok, data} ->
            if valid_article?(data) do
              {:ok, data}
            else
              IO.warn("Invalid article format in #{filename}")
              {:error, :invalid_format}
            end

          {:error, reason} ->
            IO.warn("Failed to parse JSON in #{filename}: #{reason}")
            {:error, :json_parse_error}
        end

      {:error, reason} ->
        IO.warn("Failed to read file #{filename}: #{reason}")
        {:error, reason}
    end
  end

  @required_keys ~w[id title content subtitle]
  defp valid_article?(data) do
    is_map(data) and Enum.all?(@required_keys, &Map.has_key?(data, &1))
  end
end
