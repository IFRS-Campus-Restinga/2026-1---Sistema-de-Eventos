import sys
import subprocess
from pathlib import Path


def main():
    # Retorna um nível na árvore de diretórios (de backend/scripts para backend)
    base_dir = Path(__file__).resolve().parent.parent

    # Define os nomes mais comuns para diretórios de ambientes virtuais
    venv_names = [".venv", "venv", "env"]
    celery_executable = None

    # Identifica o SO e verifica qual diretório de ambiente virtual contém o executável
    for venv_name in venv_names:
        if sys.platform == "win32":
            path_candidate = base_dir / venv_name / "Scripts" / "celery.exe"
        else:
            path_candidate = base_dir / venv_name / "bin" / "celery"

        if path_candidate.exists():
            celery_executable = path_candidate
            break

    # Interrompe a execução caso o executável não seja encontrado em nenhum dos diretórios
    if celery_executable is None:
        print(
            "Erro: Executável do Celery não encontrado nos diretórios de venv conhecidos."
        )
        sys.exit(1)

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
