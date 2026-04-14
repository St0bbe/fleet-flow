import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Mission } from '@/types/fleet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function generateMissionPDF(mission: Mission, mapImageDataUrl?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FleetTrack — Relatório de Missão', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Missão #${mission.id.slice(0, 8)}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Trip data table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Viagem', 14, y);
  y += 5;

  const tripData = [
    ['Objetivo', mission.objective],
    ['Motorista', mission.driverName],
    ['Veículo', `${mission.vehicleModel} (${mission.vehiclePlate})`],
    ['Início', format(new Date(mission.startDate), "dd/MM/yyyy HH:mm", { locale: ptBR })],
    ['Término', mission.endDate ? format(new Date(mission.endDate), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '—'],
    ['Local Retirada', mission.pickupLocation],
    ['Local Devolução', mission.returnLocation || '—'],
    ['Km Inicial', mission.odometerStart.toLocaleString()],
    ['Km Final', mission.odometerEnd?.toLocaleString() || '—'],
    ['Distância', mission.odometerEnd ? `${(mission.odometerEnd - mission.odometerStart).toLocaleString()} km` : '—'],
    ['Pontos GPS', `${mission.route.length} pontos rastreados`],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: tripData,
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Route Map Image
  if (mapImageDataUrl) {
    if (y > 140) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Rota Percorrida', 14, y);
    y += 5;
    const imgWidth = pageWidth - 28;
    const imgHeight = imgWidth * 0.5;
    doc.addImage(mapImageDataUrl, 'PNG', 14, y, imgWidth, imgHeight);
    y += imgHeight + 10;
  }

  // Checklist In
  if (mission.checklistIn.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Checklist de Retirada', 14, y);
    y += 5;

    const checkInData = mission.checklistIn.map(c => [
      c.question,
      typeof c.answer === 'boolean' ? (c.answer ? '✓ OK' : '✗ Não') : String(c.answer),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Pergunta', 'Resposta']],
      body: checkInData,
      theme: 'striped',
      styles: { fontSize: 9 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Checklist Out
  if (mission.checklistOut && mission.checklistOut.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Checklist de Devolução', 14, y);
    y += 5;

    const checkOutData = mission.checklistOut.map(c => [
      c.question,
      typeof c.answer === 'boolean' ? (c.answer ? '✓ OK' : '✗ Não') : String(c.answer),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Pergunta', 'Resposta']],
      body: checkOutData,
      theme: 'striped',
      styles: { fontSize: 9 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Notes
  if (mission.notesIn) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações (Retirada)', 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(mission.notesIn, 14, y, { maxWidth: pageWidth - 28 });
    y += 15;
  }

  if (mission.notesOut) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Avarias (Devolução)', 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(mission.notesOut, 14, y, { maxWidth: pageWidth - 28 });
    y += 15;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `FleetTrack — Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })} — Página ${i}/${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`missao-${mission.id.slice(0, 8)}.pdf`);
}
