import Table from 'react-bootstrap/Table';
import { FaCircleArrowLeft } from 'react-icons/fa6';
import { FaCircleArrowRight } from 'react-icons/fa6';

export default function Vinculo({
    cabecario1 = '',
    cabecario2 = '',
    corCabecario = '',
    corTexto = '',
    dados1 = [],
    dados2 = [],
    onAcao1,
    onAcao2,
    selecionado,
    renderItem = (item) => item.nome || item.name || item.username,
    // esse renderItem é só pq o user n tem "name", mas sim "username", 
    // então ele ta aq por isso, mas ele filtra se o item tem name ou username, 
    // ent ta sereno
}) {
    return (
        <>
            <div className="d-flex gap-5">
                <div
                    style={{
                        maxHeight: '400px',
                        width: '50%',
                        overflowY: 'auto',
                    }}
                >
                    <Table>
                        <thead>
                            <tr>
                                <th
                                    className="text-center fw-bold"
                                    style={{
                                        color: corTexto,
                                        background: corCabecario,
                                        position: 'sticky',
                                        zIndex: 10,
                                        top: 0,
                                    }}
                                >
                                    {cabecario1}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados1.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="d-flex">
                                            <span className="mx-auto">{renderItem(item)}</span>
                                            <FaCircleArrowRight
                                                className="text-success"
                                                size={20}
                                                onClick={() => onAcao2(item.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div
                    style={{
                        overflowY: 'auto',
                        maxHeight: '400px',
                        width: '50%',
                    }}
                >
                    <Table>
                        <thead>
                            <tr>
                                <th
                                    className="text-center fw-bold"
                                    style={{
                                        color: corTexto,
                                        background: corCabecario,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10,
                                    }}
                                >
                                    {cabecario2}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selecionado ? dados2.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="d-flex">
                                            <FaCircleArrowLeft
                                                className="text-success"
                                                size={20}
                                                onClick={() => onAcao1(item.id)}
                                            />
                                            <span className="mx-auto">{renderItem(item)}</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : null}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    );
}
