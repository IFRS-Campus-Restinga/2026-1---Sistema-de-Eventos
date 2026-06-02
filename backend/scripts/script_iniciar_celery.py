import sys
import subprocess
from pathlib import Path


def main():
    # Retorna um nível na árvore de diretórios (de backend/scripts para backend)
    base_dir = Path(__file__).resolve().parent.parent

    # Identifica o SO para mapear o caminho correto do ambiente virtual
    if sys.platform == "win32":
        celery_executable = base_dir / "venv" / "Scripts" / "celery.exe"
    else:
        celery_executable = base_dir / "venv" / "bin" / "celery"

    # Monta os argumentos do comando do worker
    command = [
        str(celery_executable),
        "-A",
        "backend",
        "worker",
        "-l",
        "info",
        "--pool=solo",
    ]

    try:
        # Executa o processo apontando para a raiz do backend
        subprocess.run(command, cwd=base_dir, check=True)
    except Exception as e:
        print(f"\nOcorreu um erro ao executar o Celery: {e}")


if __name__ == "__main__":
    main()
