import os
import sys
import platform
import subprocess

# Obtém o caminho absoluto da pasta onde o script está (backend/scripts)
diretorio_script = os.path.dirname(os.path.abspath(__file__))

# Obtém o caminho da pasta raiz (backend)
raiz_projeto = os.path.dirname(diretorio_script)

sistema = platform.system()

# Define os possíveis nomes para a pasta do ambiente virtual
nomes_venv = ["venv", ".venv", "env"]
nome_venv_encontrado = None

# Verifica qual diretório de ambiente virtual existe
for nome in nomes_venv:
    if os.path.isdir(os.path.join(raiz_projeto, nome)):
        nome_venv_encontrado = nome
        break

# Se não encontrar nenhum, exibe erro e encerra
if not nome_venv_encontrado:
    print(
        f"[ERRO] Nenhum ambiente virtual ({', '.join(nomes_venv)}) encontrado em: {raiz_projeto}"
    )
    input("\nPressione Enter para sair...")
    sys.exit(1)

# Formata o comando de ativação com base no sistema operacional e no nome encontrado
if sistema == "Windows":
    ativacao = rf"call {nome_venv_encontrado}\Scripts\activate.bat"
else:
    ativacao = f". {nome_venv_encontrado}/bin/activate"

# Constrói o comando completo de migrações
comando = (
    f"{ativacao} && "
    "python manage.py makemigrations eventos_session && "
    "python manage.py makemigrations api && "
    "python manage.py makemigrations emails && "
    "python manage.py migrate"
)

# O parâmetro cwd=raiz_projeto garante a execução no diretório correto
subprocess.run(comando, shell=True, cwd=raiz_projeto)

print("Script Finalizado!")
input("\nPressione Enter para sair...")
