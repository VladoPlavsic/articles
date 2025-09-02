defmodule Articles.Repo do
  use Ecto.Repo,
    otp_app: :articles,
    adapter: Ecto.Adapters.Postgres
end
