defmodule Articles.Reader do
  # TODO: Move this to config... or even better
  # move it to database)

  @otp_app :articles
  @articles_dir "/articles"

  def list_articles do
    case get_articles_path() |> File.ls() do
      {:ok, files} ->
        files
        |> Enum.filter(&String.ends_with?(&1, ".json"))
        |> Enum.map(&read_article/1)
        |> Enum.filter(&match?({:ok, _}, &1))
        |> Enum.map(fn {:ok, data} ->
          md_content = read_md_content(data["content"])
          Articles.Article.new(data, md_content)
        end)
        |> Enum.sort_by(& &1.id)

      {:error, reason} ->
        IO.warn("Failed to read articles directory: #{reason}")
        []
    end
  end

  def list_article_title_id_pairs do
    list_articles()
  end

  def find_article(article_id) do
    list_articles()
    |> Enum.find(&(&1.id == article_id))
  end

  defp read_article(filename) do
    filepath = get_articles_path() |> Path.join(filename)

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

  # `:code.priv_dir/1` must be called in runtime
  defp get_articles_path do
    @otp_app
    |> :code.priv_dir()
    |> Path.join(@articles_dir)
  end

  @required_keys ~w[id title content subtitle published_at]
  defp valid_article?(data) do
    is_map(data) and Enum.all?(@required_keys, &Map.has_key?(data, &1))
  end

  defp read_md_content(filename) do
    get_articles_path()
    |> Path.join(filename)
    |> File.read!()
  end
end
