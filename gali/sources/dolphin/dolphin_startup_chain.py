from typing import Iterable

from gali.sources.abc_stemmed_cli_startup_chain import ABCStemmedCLIStartupChain


class DolphinStartupChain(ABCStemmedCLIStartupChain):

    name = "Dolphin"
    stem = ["dolphin-emu"]

    def get_start_command_suffix(self) -> Iterable[str]:
        suffix = list()
        # TODO add option to hide the UI
        # if kwargs["no_ui"]: suffix.append("-b")
        suffix.extend(["-e", self.game.game_path])
        return suffix