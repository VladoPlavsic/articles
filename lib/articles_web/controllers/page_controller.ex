defmodule ArticlesWeb.PageController do
  use ArticlesWeb, :controller

  def home(conn, _params) do
    articles = Articles.Reader.list_articles()
    render(conn, :home, articles: articles, layout: {ArticlesWeb.Layouts, :root})
  end

  def article(conn, %{"id" => id}) do
    article = id |> String.to_integer() |> Articles.Reader.find_article()
    render(conn, :article, article: article, layout: {ArticlesWeb.Layouts, :root})
  end
end
