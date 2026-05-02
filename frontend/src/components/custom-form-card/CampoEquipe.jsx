import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/esm/Button';
import { BsPlusCircleFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';

export default function CampoEquipe({
    id,
    campo,
    erro,
    valor,
    onChange,
    desativado,
    corTexto,
}) {
    const estadoBase = {
        sou_orientador: false,
        orientador: '',
        autor_principal: {
            nome: '',
            instituicao_curso: '',
        },
        equipe: [],
    };

    const estado =
        valor && typeof valor === 'object'
            ? { ...estadoBase, ...valor }
            : estadoBase;

    const equipe = Array.isArray(estado.equipe) ? estado.equipe : [];

    function atualizar(parcial) {
        onChange({ ...estado, ...parcial });
    }

    function alterarAutorPrincipal(field, value) {
        atualizar({
            autor_principal: {
                ...(estado.autor_principal || estadoBase.autor_principal),
                [field]: value,
            },
        });
    }

    function alterarMembro(index, field, value) {
        const novaEquipe = [...equipe];
        novaEquipe[index] = { ...novaEquipe[index], [field]: value };
        atualizar({ equipe: novaEquipe });
    }

    function adicionarMembro() {
        atualizar({
            equipe: [
                ...equipe,
                { nome: '', instituicao_curso: '', funcao: 'COAUTOR' },
            ],
        });
    }

    function removerMembro(index) {
        atualizar({ equipe: equipe.filter((_, i) => i !== index) });
    }

    function trocarSouOrientador(checked) {
        const primeiroMembro = equipe[0];
        const usuarioEhPrimeiroCoautor =
            primeiroMembro &&
            primeiroMembro.nome === autorPrincipalNome &&
            primeiroMembro.instituicao_curso === autorPrincipalCurso;

        if (checked) {
            atualizar({
                sou_orientador: true,
                orientador: '',
                equipe: usuarioEhPrimeiroCoautor
                    ? equipe
                    : [
                          {
                              nome: autorPrincipalNome,
                              instituicao_curso: autorPrincipalCurso,
                              funcao: 'COAUTOR',
                          },
                          ...equipe,
                      ],
            });
            return;
        }

        atualizar({
            sou_orientador: false,
            equipe: usuarioEhPrimeiroCoautor ? equipe.slice(1) : equipe,
        });
    }

    const autorPrincipalNome = campo?.autorPrincipalNome || 'Autor Principal';
    const autorPrincipalCurso = campo?.autorPrincipalCurso || '-';
    const orientadorLabel = campo?.orientadorLabel || 'Orientador(a)';
    const autorPrincipalEditavel =
        estado.autor_principal || estadoBase.autor_principal;

    return (
        <div id={id}>
            <div className="mb-4">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-4 mb-3">
                    <Form.Label
                        className="mb-0 fw-bold fs-4"
                        style={{ color: corTexto }}
                    >
                        {orientadorLabel} *
                    </Form.Label>
                    <Form.Check
                        type="checkbox"
                        label="Sou o Orientador"
                        checked={!!estado.sou_orientador}
                        disabled={desativado}
                        onChange={(e) => trocarSouOrientador(e.target.checked)}
                    />
                </div>

                {!estado.sou_orientador && (
                    <div className="mb-3">
                        <Form.Control
                            placeholder={
                                campo?.orientadorPlaceholder ||
                                'Digite o nome ou CPF do orientador...'
                            }
                            value={estado.orientador || ''}
                            disabled={desativado}
                            onChange={(e) =>
                                atualizar({ orientador: e.target.value })
                            }
                        />
                        <div
                            className="mt-2 text-muted"
                            style={{ fontSize: '0.95rem' }}
                        >
                            O orientador recebera um e-mail para validar este
                            trabalho.
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 mb-4">
                <h6
                    className="fw-bold mb-3 fs-4 d-flex justify-content-center justify-content-md-start"
                    style={{ color: corTexto }}
                >
                    Autores e Coautores
                </h6>
                <Table
                    hover
                    responsive
                    className="mt-3 align-middle d-none d-md-table"
                    style={{
                        border: '1px solid #dee2e6',
                        borderCollapse: 'collapse',
                    }}
                >
                    <thead>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <th
                                className="py-2 px-3 fw-bold text-dark"
                                style={{
                                    background: '#F8F9FA',
                                    borderRight: '1px solid #dee2e6',
                                    width: '35%',
                                }}
                            >
                                Nome Completo
                            </th>
                            <th
                                className="py-2 px-3 fw-bold text-dark"
                                style={{
                                    background: '#F8F9FA',
                                    borderRight: '1px solid #dee2e6',
                                    width: '35%',
                                }}
                            >
                                Curso/Instituicao
                            </th>
                            <th
                                className="py-2 px-3 fw-bold text-dark"
                                style={{
                                    background: '#F8F9FA',
                                    borderRight: '1px solid #dee2e6',
                                    width: '20%',
                                }}
                            >
                                Papel
                            </th>
                            <th
                                className="py-2 px-3 fw-bold text-dark text-center"
                                style={{ background: '#F8F9FA', width: '10%' }}
                            >
                                Ação
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td
                                className="px-3 py-2"
                                style={{ borderRight: '1px solid #dee2e6' }}
                            >
                                {estado.sou_orientador ? (
                                    <Form.Control
                                        type="text"
                                        value={
                                            autorPrincipalEditavel.nome || ''
                                        }
                                        onChange={(e) =>
                                            alterarAutorPrincipal(
                                                'nome',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nome do autor principal"
                                        disabled={desativado}
                                    />
                                ) : (
                                    autorPrincipalNome
                                )}
                            </td>
                            <td
                                className="px-3 py-2"
                                style={{ borderRight: '1px solid #dee2e6' }}
                            >
                                {estado.sou_orientador ? (
                                    <Form.Control
                                        type="text"
                                        value={
                                            autorPrincipalEditavel.instituicao_curso ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            alterarAutorPrincipal(
                                                'instituicao_curso',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Curso/Instituicao do autor principal"
                                        disabled={desativado}
                                    />
                                ) : (
                                    autorPrincipalCurso
                                )}
                            </td>
                            <td
                                className="px-3 py-2"
                                style={{ borderRight: '1px solid #dee2e6' }}
                            >
                                <span
                                    className="badge rounded-pill px-2 py-2 fw-bold"
                                    style={{
                                        backgroundColor: '#3B82F6',
                                        minWidth: '100px',
                                    }}
                                >
                                    Autor Principal
                                </span>
                            </td>
                            <td className="text-center py-2">-</td>
                        </tr>

                        {equipe.map((membro, index) => (
                            <tr
                                key={`${id}-membro-${index}`}
                                style={{ borderBottom: '1px solid #dee2e6' }}
                            >
                                <td
                                    className="px-3 py-2"
                                    style={{ borderRight: '1px solid #dee2e6' }}
                                >
                                    <Form.Control
                                        value={membro?.nome || ''}
                                        onChange={(e) =>
                                            alterarMembro(
                                                index,
                                                'nome',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nome do coautor"
                                        disabled={
                                            desativado ||
                                            (estado.sou_orientador &&
                                                index === 0)
                                        }
                                    />
                                </td>
                                <td
                                    className="px-3 py-2"
                                    style={{ borderRight: '1px solid #dee2e6' }}
                                >
                                    <Form.Control
                                        type="text"
                                        value={membro?.instituicao_curso || ''}
                                        onChange={(e) =>
                                            alterarMembro(
                                                index,
                                                'instituicao_curso',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Curso/Instituicao"
                                        disabled={
                                            desativado ||
                                            (estado.sou_orientador &&
                                                index === 0)
                                        }
                                    />
                                </td>
                                <td
                                    className="px-3 py-2"
                                    style={{ borderRight: '1px solid #dee2e6' }}
                                >
                                    <span className="text-muted">
                                        {estado.sou_orientador && index === 0
                                            ? 'Coautor (Voce)'
                                            : 'Coautor'}
                                    </span>
                                </td>
                                <td className="text-center py-2">
                                    <Button
                                        variant="danger"
                                        className="p-1"
                                        style={{
                                            borderRadius: '6px',
                                            width: '32px',
                                            height: '32px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onClick={() => removerMembro(index)}
                                        disabled={
                                            desativado ||
                                            (estado.sou_orientador &&
                                                index === 0)
                                        }
                                    >
                                        <MdDelete size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="d-md-none mt-3 d-flex flex-column gap-3">
                    <div
                        className="border rounded p-3"
                        style={{ borderColor: '#dee2e6' }}
                    >
                        <div className="small text-muted mb-1">
                            Autor Principal
                        </div>
                        {estado.sou_orientador ? (
                            <>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-1">
                                        Nome Completo
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={
                                            autorPrincipalEditavel.nome || ''
                                        }
                                        onChange={(e) =>
                                            alterarAutorPrincipal(
                                                'nome',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nome do autor principal"
                                        disabled={desativado}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="mb-1">
                                        Curso/Instituicao
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={
                                            autorPrincipalEditavel.instituicao_curso ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            alterarAutorPrincipal(
                                                'instituicao_curso',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Curso/Instituicao do autor principal"
                                        disabled={desativado}
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <>
                                <div className="fw-semibold">
                                    {autorPrincipalNome}
                                </div>
                                <div className="text-muted">
                                    {autorPrincipalCurso}
                                </div>
                            </>
                        )}
                    </div>

                    {equipe.map((membro, index) => (
                        <div
                            key={`${id}-membro-mobile-${index}`}
                            className="border rounded p-3"
                            style={{ borderColor: '#dee2e6' }}
                        >
                            <div className="small text-muted mb-1">
                                {estado.sou_orientador && index === 0
                                    ? 'Coautor 1 (Voce)'
                                    : `Coautor ${index + 1}`}
                            </div>

                            <Form.Group className="mb-2">
                                <Form.Label className="mb-1">
                                    Nome Completo
                                </Form.Label>
                                <Form.Control
                                    value={membro?.nome || ''}
                                    onChange={(e) =>
                                        alterarMembro(
                                            index,
                                            'nome',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Nome do coautor"
                                    disabled={
                                        desativado ||
                                        (estado.sou_orientador && index === 0)
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="mb-1">
                                    Curso/Instituicao
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={membro?.instituicao_curso || ''}
                                    onChange={(e) =>
                                        alterarMembro(
                                            index,
                                            'instituicao_curso',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Curso/Instituicao"
                                    disabled={
                                        desativado ||
                                        (estado.sou_orientador && index === 0)
                                    }
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">
                                    {estado.sou_orientador && index === 0
                                        ? 'Papel: Coautor (Voce)'
                                        : 'Papel: Coautor'}
                                </span>
                                <Button
                                    variant="danger"
                                    className="p-1"
                                    style={{
                                        borderRadius: '6px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onClick={() => removerMembro(index)}
                                    disabled={
                                        desativado ||
                                        (estado.sou_orientador && index === 0)
                                    }
                                >
                                    <MdDelete size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {erro && erro.length > 0 && (
                    <div className="invalid-feedback d-block">
                        {erro.join(', ')}
                    </div>
                )}

                <div className="col-12 col-md-3">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={adicionarMembro}
                        className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 px-3 py-2 fw-bold mt-3 w-100 w-sm-auto"
                        disabled={desativado}
                    >
                        <BsPlusCircleFill size={18} /> Adicionar Coautor
                    </Button>
                </div>
            </div>
        </div>
    );
}
