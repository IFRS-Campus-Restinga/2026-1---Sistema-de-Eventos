import React, { useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import {
    MdCheckCircle,
    MdChevronLeft,
    MdChevronRight,
    MdDelete,
} from 'react-icons/md';

const coresPerfil = {
    Organizador: '#38A149',
    Avaliador: '#FFC107',
    Participante: '#66D2ED',
};

export default function ListaInscritos({
    titulo = 'Lista de Inscritos',
    usuarios = [],
    habilitarPresenca = false,
    onRegistrarPresenca,
    onExcluir,
    onVoltar,
    paginaAnterior,
    proximaPagina,
    paginaAtual,
    totalPaginas,
    presencasRegistradas: presencasExternas,
}) {
    const temAcaoPresenca = habilitarPresenca && typeof onRegistrarPresenca === 'function';
    const temAcaoExcluir = typeof onExcluir === 'function';
    const temAcoes = temAcaoPresenca || temAcaoExcluir;
    const [presencasLocais, setPresencasLocais] = useState(new Set());
    
    // Usar presenças externas se fornecidas, caso contrário usar as locais
    const presencasRegistradas = presencasExternas instanceof Set 
        ? presencasExternas 
        : (typeof presencasExternas === 'object' && presencasExternas !== null 
            ? new Set(Object.keys(presencasExternas).filter(k => presencasExternas[k]))
            : presencasLocais);

    return (
        <Container>
            <Row className="mb-3 align-items-center">
                <Col>
                    <h2
                        style={{
                            color: '#000000',
                            fontWeight: 'bold',
                            margin: 0,
                        }}
                    >
                        {titulo}
                    </h2>
                </Col>

                {typeof onVoltar === 'function' && (
                    <Col xs="auto">
                        <Button
                            variant="outline-secondary"
                            className="d-flex align-items-center gap-2"
                            onClick={onVoltar}
                        >
                            <MdChevronLeft /> Voltar
                        </Button>
                    </Col>
                )}
            </Row>

            <div
                className="mb-4"
                style={{ borderRadius: '18px 18px 0 0', overflow: 'hidden' }}
            >
                <Table
                    responsive
                    hover
                    borderless
                    className="mb-0 align-middle shadow-sm"
                    style={{ backgroundColor: 'transparent' }}
                >
                    <thead
                        style={{
                            backgroundColor: '#fff',
                            borderBottom: '1px solid #eee',
                        }}
                    >
                        <tr>
                            <th
                                className="py-3 px-4 fw-bold text-muted small"
                                style={{ letterSpacing: '0.05em' }}
                            >
                                USUÁRIO
                            </th>
                            <th
                                className="py-3 px-3 fw-bold text-muted small"
                                style={{ letterSpacing: '0.05em' }}
                            >
                                Nº DE INSCRIÇÃO
                            </th>
                            <th
                                className="py-3 px-3 fw-bold text-muted small"
                                style={{ letterSpacing: '0.05em' }}
                            >
                                EMAIL
                            </th>
                            <th
                                className="py-3 px-3 fw-bold text-muted small"
                                style={{ letterSpacing: '0.05em' }}
                            >
                                ATRAÇÃO
                            </th>
                            <th
                                className="py-3 px-3 fw-bold text-muted small"
                                style={{ letterSpacing: '0.05em' }}
                            >
                                PERFIS NO EVENTO
                            </th>
                            {temAcoes && (
                                <th
                                    className="py-3 px-4 fw-bold text-muted small text-center"
                                    style={{ letterSpacing: '0.05em' }}
                                >
                                    AÇÕES
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {usuarios.length === 0 ? (
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <td
                                    colSpan={temAcoes ? 6 : 5}
                                    className="px-4 py-4 text-center text-muted"
                                >
                                    Nenhum usuário encontrado.
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((usuario) => (
                                <tr
                                    key={usuario.id}
                                    style={{
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: '#f8f9fa',
                                    }}
                                >
                                    <td
                                        className="px-4 py-3 text-dark fw-medium"
                                        style={{ fontSize: '0.95rem' }}
                                    >
                                        {usuario.nome ?? '-'}
                                    </td>
                                    <td
                                        className="px-3 py-3 text-secondary"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        {usuario.cpf
                                            ? usuario.cpf.replace(/[^0-9]/g, '')
                                            : '-'}
                                    </td>
                                    <td
                                        className="px-3 py-3 text-secondary"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        {usuario.email ?? '-'}
                                    </td>
                                    <td
                                        className="px-3 py-3 text-dark fw-bold"
                                        style={{ fontSize: '0.95rem' }}
                                    >
                                        {usuario.atracao ?? '-'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className="badge rounded-pill px-3 py-2 fw-bold"
                                            style={{
                                                backgroundColor:
                                                    coresPerfil[usuario.tipo] ||
                                                    '#6c757d',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            {usuario.tipo ?? '-'}
                                        </span>
                                    </td>

                                    {temAcoes && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                {temAcaoPresenca && (
                                                    <Button
                                                        variant="secondary"
                                                        className="p-1 border-0 d-inline-flex align-items-center justify-content-center"
                                                        disabled={presencasRegistradas.has(usuario.id)}
                                                        style={{
                                                            borderRadius: '4px',
                                                            width: '34px',
                                                            height: '34px',
                                                            backgroundColor:
                                                                presencasRegistradas.has(
                                                                    usuario.id
                                                                )
                                                                    ? '#38A149'
                                                                    : '#6c757d',
                                                            cursor: presencasRegistradas.has(usuario.id) 
                                                                ? 'not-allowed' 
                                                                : 'pointer',
                                                            opacity: presencasRegistradas.has(usuario.id) 
                                                                ? 1 
                                                                : 1,
                                                        }}
                                                        
                                                    >
                                                        <MdCheckCircle size={18} />
                                                    </Button>
                                                )}

                                                {temAcaoExcluir && (
                                                    <Button
                                                        variant="light"
                                                        className="p-1 border-0"
                                                        style={{
                                                            color: 'white',
                                                            backgroundColor:
                                                                '#e24c4c',
                                                            borderRadius: '4px',
                                                            width: '34px',
                                                            height: '34px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                        onClick={() =>
                                                            onExcluir(usuario)
                                                        }
                                                    >
                                                        <MdDelete size={18} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {(paginaAnterior || proximaPagina || totalPaginas > 1) && (
                <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                    {typeof paginaAnterior === 'function' && (
                        <Button
                            variant="link"
                            className="text-decoration-none d-flex align-items-center gap-1 text-muted fw-bold"
                            style={{ fontSize: '0.9rem' }}
                            onClick={paginaAnterior}
                        >
                            <MdChevronLeft size={20} /> Anterior
                        </Button>
                    )}

                    {totalPaginas > 1 && (
                        <div className="d-flex gap-2 align-items-center">
                            {Array.from({ length: totalPaginas }, (_, page) => (
                                <Button
                                    key={page}
                                    variant="link"
                                    className={`text-decoration-none d-flex align-items-center justify-content-center fw-bold ${
                                        paginaAtual === page
                                            ? 'text-white'
                                            : 'text-dark'
                                    }`}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            paginaAtual === page
                                                ? '#38A149'
                                                : 'transparent',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    {page + 1}
                                </Button>
                            ))}
                        </div>
                    )}

                    {typeof proximaPagina === 'function' && (
                        <Button
                            variant="link"
                            className="text-decoration-none d-flex align-items-center gap-1 text-dark fw-bold"
                            style={{ fontSize: '0.9rem' }}
                            onClick={proximaPagina}
                        >
                            Próxima <MdChevronRight size={20} />
                        </Button>
                    )}
                </div>
            )}
        </Container>
    );
}