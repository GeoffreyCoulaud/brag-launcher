from sqlite3 import connect, Row

from gali.sources.source import Source
from gali.games.itch_game import ItchGame
from gali.utils.locations import HOME


class ItchSource(Source):

    name: str = "Itch"
    game_class: type[ItchGame] = ItchGame
    db_path: str = f"{HOME}/.config/itch/db/butler.db"
    db_request: str = """
        SELECT
            caves.game_id,
            caves.verdict,
            games.title,
            games.cover_url,
            games.still_cover_url
        FROM
            'caves'
        INNER JOIN
            'games'
        ON
            caves.game_id = games.game_id
        ;
    """

    def get_db_contents(self) -> list[Row]:
        connection = connect(self.db_path)
        cursor = connection.execute(self.db_request)
        rows = cursor.fetchall()
        connection.close()
        return rows

    def get_games(self, rows: list[Row]) -> tuple[ItchGame]:
        games = []
        for row in rows:

            # Raw fields
            game_id = row[0]
            verdict = row[1]
            name = row[2]
            cover_url = row[3]
            still_cover_url = row[4]

            # Game image (prefer still)
            image_box_art = cover_url
            if still_cover_url is not None:
                image_box_art = still_cover_url
            image_icon = image_box_art

            # Build game
            game = self.game_class(
                game_id=game_id,
                name=name,
                verdict=verdict,
                is_installed=True,
                image_box_art=image_box_art,
                image_icon=image_icon
            )
            games.append(game)

        return tuple(games)

    def scan(self) -> tuple[ItchGame]:
        db_contents = self.get_db_contents()
        games = self.get_games(db_contents)
        return games
