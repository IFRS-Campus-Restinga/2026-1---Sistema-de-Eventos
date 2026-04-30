import React from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';

const inscritosEstaticos = [
    { id: 1, nome: 'Ana Clara Rodrigues', cpf: '123.456.789-00', email: 'ana.clara@email.com', tipo: 'Participante', status: 'Confirmado', dataInscricao: '10/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 2, nome: 'Bruno Silva Santos', cpf: '987.654.321-00', email: 'bruno.santos@email.com', tipo: 'Participante', status: 'Pendente', dataInscricao: '09/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 3, nome: 'Carlos Eduardo Oliveira', cpf: '456.123.789-00', email: 'carlos.oliveira@email.com', tipo: 'Avaliador', status: 'Confirmado', dataInscricao: '08/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 4, nome: 'Daniela Costa Lima', cpf: '789.123.456-00', email: 'daniela.costa@email.com', tipo: 'Participante', status: 'Confirmado', dataInscricao: '07/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 5, nome: 'Eduardo Ferreira Souza', cpf: '321.789.456-00', email: 'eduardo.souza@email.com', tipo: 'Organizador', status: 'Confirmado', dataInscricao: '05/04/2026', evento: 'Feira de Ciencias 2026' },
    { id: 6, nome: 'Fernanda Alves Pereira', cpf: '654.987.321-00', email: 'fernanda.alves@email.com', tipo: 'Participante', status: 'Confirmado', dataInscricao: '04/04/2026', evento: 'Feira de Ciencias 2026' },
];

export default function ListarInscritos() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="flex-fill bg-light py-4">
                <ListaInscritos
                    titulo="Lista de Inscritos"
                    usuarios={inscritosEstaticos}
                    habilitarPresenca={true}
                    onRegistrarPresenca={(usuario) => console.log('Registrar presença:', usuario)}
                    onExcluir={(usuario) => console.log('Excluir inscrito:', usuario)}
                    onVoltar={() => window.history.back()}
                    paginaAtual={0}
                    totalPaginas={3}
                />
            </main>
            <Footer 
                telefone="(51) 3333-1234" 
                endereco="Rua Alberto Hoffmann, 285" 
                ano={2026} 
                campus="Campus Restinga" 
            />
        </div>
    );
}