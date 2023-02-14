from typing import Iterable

from gali.sources.stemmed_shell_command_startup_chain import StemmedShellCommandStartupChain


class LegendaryStartupChain(StemmedShellCommandStartupChain):

    name = "Legendary"
    stem = ["legendary", "launch"]

    def get_start_command_suffix(self) -> Iterable[str]:
        return [self.game.app_name]