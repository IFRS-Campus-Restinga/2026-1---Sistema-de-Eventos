import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

export default function Tabela({
    cabecarios = [],
    cabecarioCor = '',
    dados = [],
    className = '',
    style = {},
    tamanhoPagina,
    titulo = '',
}) {
    const tamanhoPaginaFinal = tamanhoPagina ?? 5;
    const dadosSeguros = Array.isArray(dados) ? dados : [];
    const totalPaginas = Math.max(
        1,
        Math.ceil(dadosSeguros.length / tamanhoPaginaFinal),
    );

    const [paginaAtual, setPaginaAtual] = useState(1);
    const paginaAtualValida = Math.min(paginaAtual, totalPaginas);

    const indiceInicial = (paginaAtualValida - 1) * tamanhoPaginaFinal;
    const dadosPaginados = dadosSeguros.slice(
        indiceInicial,
        indiceInicial + tamanhoPaginaFinal,
    );

    return (
        <div>
            <Table hover className={className} style={style}>
                <thead>
                    {titulo && (
                        <tr>
                            <th colSpan={cabecarios.length}>{titulo}</th>
                        </tr>
                    )}
                    <tr>
                        {cabecarios.map((c, index) => (
                            <th
                                key={`header-${index}`}
                                style={{ background: cabecarioCor }}
                            >
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dadosPaginados.map((d, rowIndex) => (
                        <tr key={`row-${rowIndex}`} className="">
                            {d?.map((c, cellIndex) => (
                                <td
                                    key={`cell-${rowIndex}-${cellIndex}`}
                                    style={c?.style}
                                    className={c?.className}
                                >
                                    {c?.value || c}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {totalPaginas > 1 && (
                <div className="d-flex justify-content-center align-items-center">
                    <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                            setPaginaAtual((pagina) => Math.max(1, pagina - 1))
                        }
                        disabled={paginaAtualValida === 1}
                    >
                        Anterior
                    </Button>

                    {Array.from({ length: totalPaginas }, (_, index) => {
                        const numeroPagina = index + 1;
                        return (
                            <Button
                                key={`page-${numeroPagina}`}
                                variant={
                                    numeroPagina === paginaAtualValida
                                        ? 'success'
                                        : 'outline-success'
                                }
                                size="sm"
                                className="mx-1"
                                onClick={() => setPaginaAtual(numeroPagina)}
                            >
                                {numeroPagina}
                            </Button>
                        );
                    })}

                    <Button
                        variant="success"
                        size="sm"
                        className="ms-2"
                        onClick={() =>
                            setPaginaAtual((pagina) =>
                                Math.min(totalPaginas, pagina + 1),
                            )
                        }
                        disabled={paginaAtualValida === totalPaginas}
                    >
                        Proximo
                    </Button>
                </div>
            )}
        </div>
    );
}
