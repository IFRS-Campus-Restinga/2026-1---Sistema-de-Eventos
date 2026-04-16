import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/esm/Button';
import { InputGroup } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs';

export default function CampoDatalist({
    id,
    campo,
    erro,
    selecoes,
    setSelecoes,
    entradasDatalist,
    setEntradasDatalist,
    mostrarDatalist,
    setMostrarDatalist,
}) {
    const chave = campo?.list;
    const preSelecionadas = campo?.areas || [];
    const selecionados = chave in selecoes ? selecoes[chave] : preSelecionadas;
    const opcoes = campo?.opcoes || [];

    const opcoesFiltradas = opcoes.filter(
        (opcao) =>
            !(selecionados || []).find(
                (sel) => String(sel.value) === String(opcao.value),
            ),
    );

    const termo = String(entradasDatalist[chave] || '').toLowerCase();
    const opcoesVisiveis = termo
        ? opcoesFiltradas.filter((o) =>
              String(o.text || o.value)
                  .toLowerCase()
                  .includes(termo),
          )
        : opcoesFiltradas;

    function adicionar(opcao) {
        setSelecoes((anterior) => {
            const atuais =
                chave in anterior ? anterior[chave] : preSelecionadas;
            if (atuais.find((x) => String(x.value) === String(opcao.value))) {
                return anterior;
            }
            return { ...anterior, [chave]: [...atuais, opcao] };
        });
        setEntradasDatalist((anterior) => ({ ...anterior, [chave]: '' }));
    }

    function remover(valor) {
        setSelecoes((anterior) => {
            const atuais =
                chave in anterior ? anterior[chave] : preSelecionadas;
            return {
                ...anterior,
                [chave]: atuais.filter(
                    (x) => String(x.value) !== String(valor),
                ),
            };
        });
    }

    return (
        <InputGroup
            className="mb-2 d-flex gap-2"
            style={{ position: 'relative' }}
        >
            {selecionados.map((item, i) => (
                <div
                    className="w-100 rounded-2 d-flex align-items-center justify-content-between px-5 form-control"
                    key={i}
                >
                    <span>
                        {i + 1}. {item.text ?? item.value}
                    </span>
                    <Button
                        variant="link"
                        className="btn btn-link text-danger"
                        onClick={() => remover(item.value)}
                    >
                        <BsTrash size={20} />
                    </Button>
                </div>
            ))}

            <div className="d-flex gap-2 w-100">
                <div style={{ position: 'relative', width: '100%' }}>
                    <Form.Control
                        id={id}
                        placeholder={
                            campo?.placeholder ||
                            `Selecione ${campo?.titulo || 'o campo'}`
                        }
                        value={entradasDatalist[chave] || ''}
                        onChange={(e) =>
                            setEntradasDatalist((anterior) => ({
                                ...anterior,
                                [chave]: e.target.value,
                            }))
                        }
                        onFocus={() =>
                            setMostrarDatalist((anterior) => ({
                                ...anterior,
                                [chave]: true,
                            }))
                        }
                        onBlur={() =>
                            setTimeout(
                                () =>
                                    setMostrarDatalist((anterior) => ({
                                        ...anterior,
                                        [chave]: false,
                                    })),
                                150,
                            )
                        }
                    />

                    {erro && (
                        <div className="invalid-feedback d-block">
                            {erro.join(', ')}
                        </div>
                    )}

                    {mostrarDatalist[chave] && opcoesVisiveis.length > 0 && (
                        <div
                            className="list-group position-absolute bg-white overflow-y-auto top-100"
                            style={{
                                left: 0,
                                right: 0,
                                zIndex: 1050,
                                maxHeight: 200,
                            }}
                        >
                            {opcoesVisiveis.map((opcao, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onMouseDown={() => {
                                        setEntradasDatalist((anterior) => ({
                                            ...anterior,
                                            [chave]: opcao.text ?? opcao.value,
                                        }));
                                        setMostrarDatalist((anterior) => ({
                                            ...anterior,
                                            [chave]: false,
                                        }));
                                    }}
                                >
                                    {opcao.text ?? opcao.value}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    className="btn btn-success"
                    onClick={() => {
                        const encontrado = opcoesFiltradas.find(
                            (o) =>
                                String(o.text || o.value).toLowerCase() ===
                                String(
                                    entradasDatalist[chave] || '',
                                ).toLowerCase(),
                        );
                        if (encontrado) adicionar(encontrado);
                    }}
                >
                    Adicionar
                </Button>
            </div>
        </InputGroup>
    );
}
