import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Alerta from '../components/common/Alerta';
import { Link } from 'react-router-dom';
import Select from '../components/common/Select';
import { useState } from 'react';

import { useCsrf } from '../hooks/useCsrf';
import { useGrupos } from '../hooks/useGrupos';
import { useUsers } from '../hooks/useUsers';
import { useUsersGrupos } from '../hooks/useUsersGrupos';
import Vinculo from '../components/common/Vinculo';
import { useNavigate } from 'react-router-dom';

export default function PessoasGrupos({ campus = 'Campus Restinga' }) {
    const { csrfToken } = useCsrf();
    const { grupos } = useGrupos();
    const { users } = useUsers();

    const {
        selectedGroupId,
        setSelectedGroupId,
        usersDoGrupo,
        usersNaoDoGrupo,
        loading,
        message,
        setMessage,
        handleAddUser,
        handleRemoveUser,
        handleSave,
        handleReset,
        hasChanges,
    } = useUsersGrupos(users);

    const [search, setSearch] = useState('');

    const navegate = useNavigate();

    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container fluid className="px-5">
                    <Row>
                        <Col className="text-center my-5">
                            <h1 className="fw-bold text-success">
                                Painel dos Grupos - Pessoas
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex">
                            <div className="w-25">
                                <h3 className="text-success fw-bold fs-5">
                                    Grupo
                                </h3>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="d-flex align-items-start justify-content-start">
                                <Select
                                    className="w-50"
                                    grupos={grupos}
                                    value={selectedGroupId}
                                    onChange={(event) =>
                                        setSelectedGroupId(event.target.value)
                                    }
                                    textFundo="Selecione o grupo"
                                />
                                <Button
                                    className="ms-4 h-50 text-white fw-bold text-decoration-none"
                                    variant="success"
                                    style={{ background: '#006B3F' }}
                                    as={Link}
                                    to={'/permissoesGrupos'}
                                >
                                    Atribuir Permissões
                                </Button>
                                <Button
                                    className="ms-4 h-50 text-white fw-bold text-decoration-none"
                                    variant="success"
                                    style={{ background: '#006B3F' }}
                                    as={Link}
                                    to={'/permissoesPessoas'}
                                >
                                    PermsObj
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <span className="fs-5 fw-semibold">
                                Buscar pessoas
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Digite para filtrar pessoas"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-5">
                        <Col>
                            <Vinculo
                                cabecario1="Pessoas"
                                cabecario2="Grupo"
                                corTexto="#fff"
                                corCabecario="#006B3F"
                                dados1={usersNaoDoGrupo.filter((u) =>
                                    `${u.nome || u.username}`
                                        .toLowerCase()
                                        .includes(search.trim().toLowerCase()),
                                )}
                                dados2={usersDoGrupo.filter((u) =>
                                    `${u.nome || u.username}`
                                        .toLowerCase()
                                        .includes(search.trim().toLowerCase()),
                                )}
                                onAcao1={handleRemoveUser}
                                onAcao2={handleAddUser}
                                save={handleSave}
                                selecionado={selectedGroupId}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-5">
                        <Col className="justify-content-end gap-3 d-flex">
                            <Button
                                variant="secondary"
                                onClick={() => navegate(-1)}
                                className="text-white text-decoration-none fw-bold"
                            >
                                Voltar
                            </Button>
                            <Button
                                disabled={!selectedGroupId || !hasChanges}
                                variant="success"
                                className="fw-bold"
                                onClick={handleSave}
                            >
                                Salvar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            {message && (
                <Alerta
                    mensagem={message.text}
                    variacao={message.type}
                    duracao={7000}
                />
            )}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
