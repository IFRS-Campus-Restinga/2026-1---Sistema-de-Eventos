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
import { usePermissoes } from '../hooks/usePermissoes';
import { useUsers } from '../hooks/useUsers';
import { useUsersPermissoes } from '../hooks/useUsersPermissoes';
import Vinculo from '../components/common/Vinculo';

export default function PessoasGrupos({ campus = 'Campus Restinga' }) {
    const { csrfToken } = useCsrf();
    const { perms } = usePermissoes();
    const { users } = useUsers();

    const {
        selectedUserId,
        setSelectedUserId,
        selectedUser,
        permsDoUser,
        permsNaoDoUser,
        loading,
        message,
        setMessage,
        handleAddPermission,
        handleRemovePermission,
        handleSave,
        handleReset,
        hasChanges,
    } = useUsersPermissoes(perms);

    const [search, setSearch] = useState('');

    return (
        <>
            <NavBar />
            <main className="flex-fill mb-5">
                <Container fluid className="px-5">
                    <Row>
                        <Col className="text-center my-5">
                            <h1 className="fw-bold text-success">
                                Painel de Pessoas - PermsObjs
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex">
                            <div className="w-25">
                                <h3 className="text-success fw-bold fs-5">
                                    Pessoa
                                </h3>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="d-flex align-items-start justify-content-start">
                                <Select
                                    className="w-50"
                                    grupos={users}
                                    value={selectedUserId}
                                    onChange={(event) =>
                                        setSelectedUserId(event.target.value)
                                    }
                                    textFundo="Selecione a pessoa"
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <span className="fs-5 fw-semibold">
                                Buscar permissões
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Digite para filtrar permissões"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col>
                            <Vinculo
                                cabecario1="Permissões disponíveis"
                                cabecario2="Permissões do usuário"
                                corTexto="#fff"
                                corCabecario="#006B3F"
                                dados1={permsNaoDoUser.filter((p) =>
                                    p.name
                                        .toLowerCase()
                                        .includes(search.trim().toLowerCase()),
                                )}
                                dados2={permsDoUser.filter((p) =>
                                    p.name
                                        .toLowerCase()
                                        .includes(search.trim().toLowerCase()),
                                )}
                                onAcao1={handleRemovePermission}
                                onAcao2={handleAddPermission}
                                save={handleSave}
                                selecionado={selectedUserId}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-5">
                        <Col className="justify-content-end gap-3 d-flex">
                            <Button
                                variant="secondary"
                                as={Link}
                                to={'/usuarioGrupos'}
                                className="text-white text-decoration-none fw-bold"
                            >
                                Voltar
                            </Button>
                            <Button
                                disabled={!selectedUserId || !hasChanges}
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
