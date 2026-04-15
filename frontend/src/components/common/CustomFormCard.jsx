import { useState, useRef } from 'react';
import Card from './Card';
import { Container, Row, Col, Table } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/esm/Button';
import { Link } from 'react-router-dom';
import { InputGroup } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs';

export default function CustomFormCard({
    sessao,
    titulo = '',
    Icone,
    corTexto = '',
    orientacao = 'column',
    campos = [],
    add = false,
    addButtonText = '+ Adicionar Campos',
    erros = {},
}) {
    const [selecoes, setSelecoes] = useState({});
    const [entradasDatalist, setEntradasDatalist] = useState({});
    const [mostrarDatalist, setMostrarDatalist] = useState({});
    const [fasesState, setFasesState] = useState({});
    const [mostrarOpcoesFase, setMostrarOpcoesFase] = useState({});
    const [entradasTexto, setEntradasTexto] = useState({});
    const [switchValues, setSwitchValues] = useState({});
    const [entradasTextArea, setEntradasTextArea] = useState({});
    const [entradasNumber, setEntradasNumber] = useState({});
    const refsInput = useRef({});
    const [entradasDate, setEntradasDate] = useState({});
    const [instances, setInstances] = useState([0]);

    function chamarAoAlterar(valor, id, obj) {
        const chaveInst = String(id).split('-')[0];
        const nomeCampo = obj?.name ?? obj?.titulo ?? `${obj?.tipo ?? 'campo'}`;
        if (typeof obj?.onChange === 'function')
            obj.onChange(valor, chaveInst, nomeCampo);
    }

    function obterErros(obj, id) {
        const nome = obj?.name ?? obj?.titulo;
        // checar erros em nível simples: erros[nome]
        if (erros && erros[nome]) {
            return Array.isArray(erros[nome]) ? erros[nome] : null;
        }
        // para grupos repetidos, verificar erros[campo][index]
        try {
            const chaveInst = String(id).split('-')[0];
            const idx = Number(chaveInst);
            if (!Number.isNaN(idx) && erros && typeof erros === 'object') {
                if (erros && erros[idx] && erros[idx][nome])
                    return erros[idx][nome];
                // se erros for do formato { grupo: { idx: { campo: [...] } } }
                if (
                    erros &&
                    Object.keys(erros).some((k) => !isNaN(Number(k)))
                ) {
                    if (erros[idx] && erros[idx][nome]) return erros[idx][nome];
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    function identificarTipo(obj, id) {
        const tipo = obj?.tipo;
        const fieldErrors = obterErros(obj, id);
        const temErro = fieldErrors && fieldErrors.length > 0;
        if (tipo === 'text') {
            return (
                <>
                    <Form.Control
                        type="text"
                        placeholder={
                            obj?.placeholder ||
                            `Informe ${obj?.titulo || 'o campo'}`
                        }
                        value={
                            id in entradasTexto
                                ? entradasTexto[id]
                                : obj?.preValue ?? ''
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            setEntradasTexto((prev) => ({
                                ...prev,
                                [id]: val,
                            }));
                            chamarAoAlterar(val, id, obj);
                        }}
                        className="py-3"
                        isInvalid={temErro}
                        id={id}
                    />
                    {temErro && (
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.join(', ')}
                        </Form.Control.Feedback>
                    )}
                </>
            );
        } else if (tipo === 'textarea') {
            return (
                <>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={
                            obj?.placeholder ||
                            `Informe ${obj?.titulo || 'o campo'}`
                        }
                        value={
                            id in entradasTextArea
                                ? entradasTextArea[id]
                                : obj?.preValue ?? ''
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            setEntradasTextArea((prev) => ({
                                ...prev,
                                [id]: val,
                            }));
                            chamarAoAlterar(val, id, obj);
                        }}
                        className="py-3"
                        isInvalid={temErro}
                        id={id}
                    />
                    {temErro && (
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.join(', ')}
                        </Form.Control.Feedback>
                    )}
                </>
            );
        } else if (tipo === 'switch') {
            return (
                <>
                    <Form.Check
                        type="switch"
                        checked={
                            id in switchValues
                                ? !!switchValues[id]
                                : !!obj?.preValue
                        }
                        onChange={(e) => {
                            const val = e.target.checked;
                            setSwitchValues((prev) => ({
                                ...prev,
                                [id]: val,
                            }));
                            chamarAoAlterar(val, id, obj);
                        }}
                        id={id}
                        isInvalid={temErro}
                    />
                    {temErro && (
                        <div className="invalid-feedback d-block">
                            {fieldErrors.join(', ')}
                        </div>
                    )}
                </>
            );
        } else if (tipo === 'date') {
            return (
                <>
                    <Form.Control
                        type="date"
                        value={
                            id in entradasDate
                                ? entradasDate[id]
                                : obj?.preValue ?? ''
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            setEntradasDate((prev) => ({
                                ...prev,
                                [id]: val,
                            }));
                            chamarAoAlterar(val, id, obj);
                        }}
                        className="py-3"
                        isInvalid={temErro}
                        id={id}
                    />
                    {temErro && (
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.join(', ')}
                        </Form.Control.Feedback>
                    )}
                </>
            );
        } else if (tipo === 'number') {
            return (
                <>
                    <Form.Control
                        type="number"
                        max={obj?.max || 10000}
                        min={obj?.min}
                        placeholder={
                            obj?.placeholder ||
                            `Informe ${obj?.titulo || 'o campo'}`
                        }
                        value={
                            id in entradasNumber
                                ? entradasNumber[id]
                                : obj?.preValue ?? ''
                        }
                        onChange={(e) => {
                            const raw = e.target.value;
                            const val = raw === '' ? '' : Number(raw);
                            setEntradasNumber((prev) => ({
                                ...prev,
                                [id]: raw,
                            }));
                            chamarAoAlterar(val, id, obj);
                        }}
                        className="py-3"
                        isInvalid={temErro}
                        id={id}
                    />
                    {temErro && (
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.join(', ')}
                        </Form.Control.Feedback>
                    )}
                </>
            );
        } else if (tipo === 'select') {
            return (
                <>
                    <Form.Select
                        placeholder={
                            obj?.placeholder ||
                            `Selecione ${obj?.titulo || 'o campo'}`
                        }
                        aria-label="Default select example"
                        value={
                            id in entradasTexto
                                ? entradasTexto[id]
                                : obj?.preValue ?? '#'
                        }
                        className="py-3"
                        isInvalid={temErro}
                        id={id}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEntradasTexto((prev) => ({
                                ...prev,
                                [id]: val,
                            }));
                            chamarAoAlterar(val, id, obj);
                        }}
                    >
                        {obj?.opcoes.map((opcao, i) => (
                            <option
                                key={i}
                                value={opcao.value}
                                disabled={opcao?.disabled}
                            >
                                {opcao.text}
                            </option>
                        ))}
                    </Form.Select>
                    {temErro && (
                        <Form.Control.Feedback
                            type="invalid"
                            style={{ display: 'block' }}
                        >
                            {fieldErrors.join(', ')}
                        </Form.Control.Feedback>
                    )}
                </>
            );
        } else if (tipo === 'button link') {
            return (
                <Button
                    variant={obj?.variant}
                    className="border-0 mt-2"
                    style={{ background: obj?.background }}
                >
                    <Link
                        to={obj?.to}
                        className="text-decoration-none text-white"
                    >
                        {obj?.text}
                    </Link>
                </Button>
            );
        } else if (tipo === 'file') {
            return (
                <Form.Control
                    type="file"
                    placeholder={
                        obj?.placeholder || `Envie ${obj?.titulo || 'arquivos'}`
                    }
                    onChange={(e) =>
                        setEntradasTexto((prev) => ({
                            ...prev,
                            [id]: e.target.files && e.target.files[0],
                        }))
                    }
                    className="py-3"
                    id={id}
                />
            );
        } else if (tipo === 'datalist') {
            const key = obj?.list;

            function adicionarSelecao(opcao) {
                setSelecoes((prev) => {
                    const existentes =
                        key in prev ? prev[key] : preSelecionadas || [];
                    if (
                        existentes.find(
                            (e) => String(e.value) === String(opcao.value),
                        )
                    )
                        return prev;
                    return { ...prev, [key]: [...existentes, opcao] };
                });
                setEntradasDatalist((prev) => ({ ...prev, [key]: '' }));
            }

            function removerSelecao(value) {
                setSelecoes((prev) => {
                    const existentes =
                        key in prev ? prev[key] : preSelecionadas || [];
                    const filtrados = existentes.filter(
                        (e) => String(e.value) !== String(value),
                    );
                    return { ...prev, [key]: filtrados };
                });
            }

            const preSelecionadas = obj?.areas || [];
            // preferir o array em 'selecoes' mesmo que vazio (permite remover todas)
            const selecionados =
                key in selecoes ? selecoes[key] : preSelecionadas;

            const opcoesDisponiveis = obj?.opcoes || [];
            // opções disponíveis excluem as já selecionadas (inclui preSelecionadas quando chave não existe)
            const opcoesFiltradas = opcoesDisponiveis.filter(
                (o) =>
                    !(selecionados || []).find(
                        (s) => String(s.value) === String(o.value),
                    ),
            );

            return (
                <>
                    <InputGroup
                        className="mb-2 d-flex gap-2"
                        style={{ position: 'relative' }}
                    >
                        {selecionados.map((item, i) => (
                            <div
                                className=" w-100 rounded-2 d-flex  align-items-center justify-content-between px-5 form-control"
                                key={i}
                            >
                                <span className="">
                                    {i + 1}. {item.text ?? item.value}
                                </span>
                                <div className="d-flex  justify-content-end flex-row">
                                    <Button
                                        variant="link"
                                        className="btn btn-link text-danger"
                                        onClick={() =>
                                            removerSelecao(item.value)
                                        }
                                    >
                                        <BsTrash size={20} />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="d-flex gap-2 w-100">
                            <div
                                style={{ position: 'relative', width: '100%' }}
                            >
                                <Form.Control
                                    id={id}
                                    ref={(el) => (refsInput.current[key] = el)}
                                    placeholder={
                                        obj?.placeholder ||
                                        `Selecione ${obj?.titulo || 'o campo'}`
                                    }
                                    value={entradasDatalist[key] || ''}
                                    onChange={(e) =>
                                        setEntradasDatalist((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                        }))
                                    }
                                    onFocus={() =>
                                        setMostrarDatalist((prev) => ({
                                            ...prev,
                                            [key]: true,
                                        }))
                                    }
                                    onBlur={() =>
                                        setTimeout(
                                            () =>
                                                setMostrarDatalist((prev) => ({
                                                    ...prev,
                                                    [key]: false,
                                                })),
                                            150,
                                        )
                                    }
                                />
                                {temErro && (
                                    <div className="invalid-feedback d-block">
                                        {fieldErrors.join(', ')}
                                    </div>
                                )}

                                {mostrarDatalist[key] &&
                                    (entradasDatalist[key]
                                        ? opcoesFiltradas.filter((o) =>
                                              String(o.text)
                                                  .toLowerCase()
                                                  .includes(
                                                      String(
                                                          entradasDatalist[key],
                                                      ).toLowerCase(),
                                                  ),
                                          )
                                        : opcoesFiltradas
                                    ).length > 0 && (
                                        <div
                                            className="list-group position-absolute bg-white overflow-y-auto top-100"
                                            style={{
                                                left: 0,
                                                right: 0,
                                                zIndex: 1050,
                                                maxHeight: 200,
                                            }}
                                        >
                                            {(entradasDatalist[key]
                                                ? opcoesFiltradas.filter((o) =>
                                                      String(o.text)
                                                          .toLowerCase()
                                                          .includes(
                                                              String(
                                                                  entradasDatalist[
                                                                      key
                                                                  ],
                                                              ).toLowerCase(),
                                                          ),
                                                  )
                                                : opcoesFiltradas
                                            ).map((opcao, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="list-group-item list-group-item-action"
                                                    onMouseDown={() => {
                                                        setEntradasDatalist(
                                                            (prev) => ({
                                                                ...prev,
                                                                [key]:
                                                                    opcao.text ??
                                                                    opcao.value,
                                                            }),
                                                        );
                                                        setMostrarDatalist(
                                                            (prev) => ({
                                                                ...prev,
                                                                [key]: false,
                                                            }),
                                                        );
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
                                    const match = opcoesFiltradas.find(
                                        (o) =>
                                            String(o.text).toLowerCase() ===
                                            String(
                                                entradasDatalist[key] || '',
                                            ).toLowerCase(),
                                    );
                                    if (match) adicionarSelecao(match);
                                }}
                            >
                                Adicionar
                            </Button>
                        </div>
                    </InputGroup>
                </>
            );
        } else if (tipo === 'fase') {
            const key = obj?.name || obj?.list || id;
            function addFase(keyInner, opcao) {
                setFasesState((prev) => {
                    const existentes = prev[keyInner] || [];
                    const novo = {
                        tipo: opcao?.value ?? opcao,
                        titulo: opcao?.text ?? opcao?.label ?? opcao,
                        descricao: opcao?.descricao || opcao?.desc || '',
                        inicio: '',
                        fim: '',
                        ativo: true,
                    };
                    return { ...prev, [keyInner]: [...existentes, novo] };
                });
            }

            function removeFase(keyInner, index) {
                setFasesState((prev) => {
                    const existentes = prev[keyInner] || [];
                    return {
                        ...prev,
                        [keyInner]: existentes.filter((_, i) => i !== index),
                    };
                });
            }

            function updateFaseField(keyInner, index, field, value) {
                setFasesState((prev) => {
                    const existentes = prev[keyInner] || [];
                    const copia = existentes.map((f, i) =>
                        i === index ? { ...f, [field]: value } : f,
                    );
                    return { ...prev, [keyInner]: copia };
                });
            }

            const preFases = obj?.fases || [];
            const fasesAtuais =
                fasesState[key] && fasesState[key].length > 0
                    ? fasesState[key]
                    : preFases;

            return (
                <>
                    {fasesAtuais.map((fase, idx) => (
                        <div className="p-3 border rounded mb-3" key={idx}>
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <Form.Check
                                        type="switch"
                                        label={fase.titulo || 'Fase'}
                                        className="fw-bold"
                                        checked={!!fase.ativo}
                                        onChange={(e) =>
                                            updateFaseField(
                                                key,
                                                idx,
                                                'ativo',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <small className="text-muted">
                                        {fase?.descricao ||
                                            obj?.descricao ||
                                            ''}
                                    </small>
                                </Col>

                                <Col
                                    md={6}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Form.Control
                                        type="date"
                                        value={fase.inicio || ''}
                                        onChange={(e) =>
                                            updateFaseField(
                                                key,
                                                idx,
                                                'inicio',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span>até</span>
                                    <Form.Control
                                        type="date"
                                        value={fase.fim || ''}
                                        onChange={(e) =>
                                            updateFaseField(
                                                key,
                                                idx,
                                                'fim',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <Button
                                        variant="link"
                                        className="btn btn-link text-danger"
                                        onClick={() => removeFase(key, idx)}
                                    >
                                        <BsTrash size={18} />
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    ))}

                    <div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                                setMostrarOpcoesFase((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                }))
                            }
                        >
                            + Adicionar Fase
                        </Button>

                        {mostrarOpcoesFase[key] && (
                            <div className="list-group mt-2">
                                {(obj?.opcoes || []).map((opcao, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="list-group-item list-group-item-action"
                                        onClick={() => {
                                            addFase(key, opcao);
                                            setMostrarOpcoesFase((prev) => ({
                                                ...prev,
                                                [key]: false,
                                            }));
                                        }}
                                    >
                                        {opcao?.text ??
                                            opcao?.label ??
                                            opcao?.value ??
                                            String(opcao)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            );
        }
    }

    return (
        <>
            <Card corBorda={corTexto}>
                <Container>
                    <Row>
                        <Col
                            className="ms-4 mt-4 d-flex align-items-center"
                            style={{ color: corTexto }}
                        >
                            {Icone}
                            <h2 className="mb-0 ms-3 fw-bold">{titulo}</h2>
                        </Col>
                    </Row>
                    <hr className="mx-4" />
                    <Row>
                        <Col className="mx-4 d-flex flex-column gap-2">
                            {instances.map((instKey, instIdx) => (
                                <div key={instKey} className="replica-group">
                                    {campos.map((item, i) =>
                                        !Array.isArray(item) ? (
                                            <div key={i}>
                                                <Form.Label
                                                    htmlFor={`${instKey}-${item.tipo}-${i}`}
                                                    className="fw-bold"
                                                    style={{ color: corTexto }}
                                                >
                                                    {item.titulo}
                                                </Form.Label>
                                                {identificarTipo(
                                                    item,
                                                    `${instKey}-${item.tipo}-${i}`,
                                                )}
                                            </div>
                                        ) : (
                                            <div key={i}>
                                                {item.map((campo, index) => (
                                                    <div key={index}>
                                                        <Form.Label
                                                            className="fw-bold"
                                                            style={{
                                                                color: corTexto,
                                                            }}
                                                            htmlFor={`${instKey}-${campo.tipo}-${index}`}
                                                        >
                                                            {campo.titulo}
                                                        </Form.Label>
                                                        {identificarTipo(
                                                            campo,
                                                            `${instKey}-${campo.tipo}-${index}`,
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ),
                                    )}

                                    {instances.length > 1 && (
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="link"
                                                className="text-danger"
                                                onClick={() =>
                                                    setInstances((prev) =>
                                                        prev.filter(
                                                            (_, idx) =>
                                                                idx !== instIdx,
                                                        ),
                                                    )
                                                }
                                            >
                                                Remover grupo
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {add && (
                                <div>
                                    <Button
                                        variant="primary"
                                        className="fw-bold"
                                        onClick={() =>
                                            setInstances((prev) => [
                                                ...prev,
                                                prev.length > 0
                                                    ? prev[prev.length - 1] + 1
                                                    : 0,
                                            ])
                                        }
                                    >
                                        {addButtonText}
                                    </Button>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </Card>
        </>
    );
}
