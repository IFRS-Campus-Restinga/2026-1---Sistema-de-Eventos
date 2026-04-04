import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Alerta from '../components/common/Alerta';
import { Link } from 'react-router';
import Select from '../components/common/Select';
import React, { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";

export default function DashboardEvento() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setDados)
      .catch((err) => console.error(err));
  }, []);

  if (!dados) {
  return <div className="p-10 text-center">Carregando dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white flex justify-between items-center px-8 py-4">
        <h1 className="font-bold">INSTITUTO FEDERAL</h1>
        <nav className="space-x-6">
          <span>Início</span>
          <span>Meus eventos</span>
          <span>Avaliações</span>
          <span>Gestão</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center">
            {dados.usuario?.iniciais}
          </div>
          <span>{dados.usuario?.nome}</span>
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Visão Geral do Evento</h2>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card title="TOTAL DE SUBMISSÕES" value={dados.metricas.totalSubmissoes} />
          <Card title="SEM AVALIADOR" value={dados.metricas.semAvaliador} danger />
          <Card title="DESISTÊNCIAS" value={dados.metricas.desistencias} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl shadow p-6">
            <h3>Status das Avaliações</h3>

            {dados.areas.map((area, i) => (
              <Progress key={i} {...area} />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3>Ações</h3>
            <ul>
              {dados.acoes.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ title, value, danger }) {
  return (
    <div className={`bg-white p-6 rounded shadow ${danger ? "border-red-500 border" : ""}`}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Progress({ nome, avaliados, total, cor }) {
  const percent = (avaliados / total) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <span>{nome}</span>
        <span>{avaliados}/{total}</span>
      </div>
      <div className="bg-gray-200 h-2 rounded">
        <div className={`${cor} h-2`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}