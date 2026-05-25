import os
import shutil

# Definição dos caminhos
diretorio_script = os.path.dirname(os.path.abspath(__file__))
raiz_projeto = os.path.dirname(diretorio_script)

apps = ["api", "emails", "eventos_session"]
caminho_db = os.path.join(raiz_projeto, "db.sqlite3")

# confirmação
print("O script limpara todo o banco de dados deseja continuar?")
print(
    "Os arquivo db.sqlite3 e todo conteudo da pasta migrations dos APPs serão excluidos!"
)
confirmacao = input("(S/N): ").strip().upper()

if confirmacao != "S":
    print("Operação cancelada pelo usuário.")
    exit(0)

# Exclusão do db.sqlite3
if os.path.exists(caminho_db):
    try:
        os.remove(caminho_db)
        print(f"[OK] Arquivo removido: {caminho_db}")
    except Exception as e:
        print(f"[ERRO] Falha ao remover db.sqlite3: {e}")
else:
    print("[INFO] Arquivo db.sqlite3 não encontrado. Ignorando.")

# Limpeza migrations
for app in apps:
    caminho_migrations = os.path.join(raiz_projeto, app, "migrations")

    if not os.path.exists(caminho_migrations):
        print(f"[INFO] Pasta não encontrada: {caminho_migrations}")
        continue

    for item in os.listdir(caminho_migrations):
        # Preserva o __init__.py
        if item == "__init__.py":
            continue

        caminho_item = os.path.join(caminho_migrations, item)

        try:
            if os.path.isfile(caminho_item):
                os.remove(caminho_item)
            elif os.path.isdir(caminho_item):
                # Remove diretórios __pycache__ dos apps
                shutil.rmtree(caminho_item)
        except Exception as e:
            print(f"[ERRO] Falha ao remover {caminho_item}: {e}")

    print(f"[OK] Migrations limpas para o app: {app}")

# Limpeza do __pycache__ do projeto (backend)
caminho_pycache_principal = os.path.join(raiz_projeto, "backend", "__pycache__")

if os.path.exists(caminho_pycache_principal):
    try:
        shutil.rmtree(caminho_pycache_principal)
        print(
            f"[OK] Cache da configuração principal removido: {caminho_pycache_principal}"
        )
    except Exception as e:
        print(f"[ERRO] Falha ao remover {caminho_pycache_principal}: {e}")
else:
    print("[INFO] Cache da configuração principal não encontrado. Ignorando.")

print("\nScript Finalizado!")
input("\nPressione Enter para sair...")
