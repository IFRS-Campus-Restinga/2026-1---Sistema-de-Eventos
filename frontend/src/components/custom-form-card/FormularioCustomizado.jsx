import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/esm/Button';
import Card from '../common/Card';
import RenderizarCampo from './RenderizarCampo';
import eArray from '../../utils/eArray';
import {
    limparEstadoDaInstancia,
    obterChaveInstancia,
    obterErrosCampo,
    obterNomeCampo,
} from './utils';

export default function CustomFormCard({
    titulo = '',
    Icone,
    corTexto = '',
    campos = [],
    add = false,
    iniciarSemGrupo = false,
    addButtonText = '+ Adicionar Campos',
    erros = {},
    gruposIniciais,
    aoRemoverGrupo,
}) {
    const listaGruposIniciais = useMemo(
        () => (eArray(gruposIniciais) ? gruposIniciais : []),
        [gruposIniciais],
    );
    const assinaturaGruposIniciais = useMemo(
        () =>
            `${listaGruposIniciais.length}:${listaGruposIniciais
                .map((grupo, idx) => grupo?.id ?? idx)
                .join(',')}`,
        [listaGruposIniciais],
    );

    const idsIniciais = useMemo(() => {
        if (add && listaGruposIniciais.length > 0) {
            return listaGruposIniciais.map((_, i) => i);
        }

        if (add && iniciarSemGrupo) {
            return [];
        }

        return [0];
    }, [add, iniciarSemGrupo, listaGruposIniciais]);

    const [instanciasAdicionadas, setInstanciasAdicionadas] = useState([]);
    const [instanciasRemovidas, setInstanciasRemovidas] = useState([]);
    const [valores, setValores] = useState({});
    const [selecoes, setSelecoes] = useState({});
    const [entradasDatalist, setEntradasDatalist] = useState({});
    const [mostrarDatalist, setMostrarDatalist] = useState({});
    const [fases, setFases] = useState({});
    const [mostrarOpcoes, setMostrarOpcoes] = useState({});

    const iniciaisAplicadosRef = useRef(false);
    const instanciasInicializadasRef = useRef(new Set());

    const instancias = useMemo(
        () => [
            ...idsIniciais.filter((id) => !instanciasRemovidas.includes(id)),
            ...instanciasAdicionadas.filter(
                (id) => !instanciasRemovidas.includes(id),
            ),
        ],
        [idsIniciais, instanciasAdicionadas, instanciasRemovidas],
    );

    useEffect(() => {
        iniciaisAplicadosRef.current = false;
        instanciasInicializadasRef.current = new Set();
    }, [assinaturaGruposIniciais]);

    useEffect(() => {
        if (!add || iniciaisAplicadosRef.current) return;
        if (listaGruposIniciais.length === 0) return;

        listaGruposIniciais.forEach((grupo, idx) => {
            if (!grupo || typeof grupo !== 'object') return;

            campos.forEach((item) => {
                const lista = eArray(item) ? item : [item];
                lista.forEach((campo) => {
                    const nome = obterNomeCampo(campo);
                    const valor = grupo[nome];
                    if (
                        typeof valor !== 'undefined' &&
                        typeof campo?.onChange === 'function'
                    ) {
                        campo.onChange(valor, String(idx), nome);
                    }
                });
            });
        });

        iniciaisAplicadosRef.current = true;
    }, [add, campos, listaGruposIniciais]);

    function aoAlterar(valor, id, campo) {
        const chaveInstancia = obterChaveInstancia(id);
        const nomeCampo = obterNomeCampo(campo);
        if (typeof campo?.onChange === 'function') {
            campo.onChange(valor, chaveInstancia, nomeCampo);
        }
    }

    const obterValor = useCallback(
        (id, campo) => {
            if (id in valores) return valores[id];

            const chaveInstancia = Number(obterChaveInstancia(id));
            const grupo = listaGruposIniciais[chaveInstancia];
            const nome = campo?.name ?? campo?.titulo;
            const valorGrupo = grupo && nome ? grupo[nome] : undefined;

            if (typeof valorGrupo !== 'undefined') return valorGrupo;
            return campo?.preValue;
        },
        [valores, listaGruposIniciais],
    );

    function removerGrupo(chaveInstancia) {
        setValores((anterior) =>
            limparEstadoDaInstancia(anterior, chaveInstancia),
        );
        if (typeof aoRemoverGrupo === 'function') {
            aoRemoverGrupo(String(chaveInstancia));
        }
        setInstanciasRemovidas((anterior) =>
            anterior.includes(chaveInstancia)
                ? anterior
                : [...anterior, chaveInstancia],
        );
        setInstanciasAdicionadas((anterior) =>
            anterior.filter((id) => id !== chaveInstancia),
        );
    }

    function adicionarGrupo() {
        const idsConhecidos = [
            ...idsIniciais,
            ...instanciasAdicionadas,
            ...instanciasRemovidas,
        ];
        const novoId =
            (idsConhecidos.length > 0 ? Math.max(...idsConhecidos) : 0) + 1;

        setInstanciasAdicionadas((anterior) => [...anterior, novoId]);
        setInstanciasRemovidas((anterior) =>
            anterior.filter((id) => id !== novoId),
        );
    }

    useEffect(() => {
        instancias.forEach((chaveInstancia) => {
            if (instanciasInicializadasRef.current.has(chaveInstancia)) return;

            campos.forEach((item, idxItem) => {
                const lista = eArray(item) ? item : [item];
                lista.forEach((campo, idxCampo) => {
                    if (typeof campo?.onChange !== 'function') return;

                    const id = `${chaveInstancia}-${campo.tipo}-${idxItem}-${idxCampo}`;
                    const nome = obterNomeCampo(campo);
                    const valor = obterValor(id, campo);
                    campo.onChange(valor, String(chaveInstancia), nome);
                });
            });

            instanciasInicializadasRef.current.add(chaveInstancia);
        });
    }, [instancias, campos, obterValor]);

    return (
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
                        {instancias.map((chaveInstancia, idxInstancia) => (
                            <div key={chaveInstancia} className="replica-group">
                                {campos.map((item, i) => {
                                    const lista = eArray(item) ? item : [item];

                                    return (
                                        <div key={i}>
                                            {lista.map((campo, idxCampo) => {
                                                if (campo?.visivel === false)
                                                    return null;

                                                const id = `${chaveInstancia}-${campo.tipo}-${i}-${idxCampo}`;
                                                const erro = obterErrosCampo(
                                                    erros,
                                                    campo,
                                                    id,
                                                    idxInstancia,
                                                );

                                                return (
                                                    <div key={idxCampo}>
                                                        <Form.Label
                                                            htmlFor={id}
                                                            className="fw-bold"
                                                            style={{
                                                                color: corTexto,
                                                            }}
                                                        >
                                                            {campo.titulo}
                                                        </Form.Label>

                                                        <RenderizarCampo
                                                            id={id}
                                                            campo={campo}
                                                            erro={erro}
                                                            obterValor={
                                                                obterValor
                                                            }
                                                            setValores={
                                                                setValores
                                                            }
                                                            aoAlterar={
                                                                aoAlterar
                                                            }
                                                            estadoDatalist={{
                                                                selecoes,
                                                                setSelecoes,
                                                                entradasDatalist,
                                                                setEntradasDatalist,
                                                                mostrarDatalist,
                                                                setMostrarDatalist,
                                                            }}
                                                            estadoFase={{
                                                                fases,
                                                                setFases,
                                                                mostrarOpcoes,
                                                                setMostrarOpcoes,
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}

                                {add && (
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="link"
                                            className="text-danger"
                                            onClick={() =>
                                                removerGrupo(chaveInstancia)
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
                                    onClick={adicionarGrupo}
                                >
                                    {addButtonText}
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </Card>
    );
}
