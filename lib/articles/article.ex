defmodule Articles.Article do
  @enforce_keys ~w[id title md_content published_at]a
  defstruct [:id, :title, :subtitle, :md_content, :published_at]

  def new(%{} = data, md_content) do
    %__MODULE__{
      id: data["id"],
      title: data["title"],
      subtitle: data["subtitle"],
      published_at: data["published_at"],
      md_content: md_content
    }
  end
end
