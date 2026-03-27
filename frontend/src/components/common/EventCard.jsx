import React from 'react';
import Button from 'react-bootstrap/Button';
import { MdOutlineSearch } from 'react-icons/md';
import Card from './Card';

export default function EventCard({
    title,
    dateRange,
    phaseLabel,
    phaseColor = '#106D47',
    description,
    detailsLabel = 'Ver Detalhes',
    onDetailsClick,
    Icon,
}) {
    return (
        <Card>
            <div className="d-flex ms-5 mt-5 align-items-center">
                <h3 className="fw-bold">{title}</h3>
                <span className="ms-3 fw-bold">Realização: {dateRange}</span>
            </div>
            <div className="d-flex ms-5  align-items-center mt-2">
                <span className="fw-bold">
                    Fase atual:{' '}
                    <span className="fw-bold" style={{ color: phaseColor }}>
                        {phaseLabel}
                    </span>
                </span>
                <div className="d-flex w-75 justify-content-end">
                    <Button
                        variant="success"
                        className="fw-bold"
                        style={{ background: '#00A44B', border: 'none' }}
                        onClick={onDetailsClick}
                    >
                        {Icon ? (
                            <Icon size={20} />
                        ) : (
                            <MdOutlineSearch size={20} />
                        )}
                        {detailsLabel}
                    </Button>
                </div>
            </div>
            <div className="d-flex ms-5  align-items-center mt-2">
                <span className="fw-bold">Descrição:</span>
            </div>
            <div className="d-flex ms-5  align-items-center mt-2">
                <span className="fw-light text-break w-50">{description}</span>
            </div>
        </Card>
    );
}
