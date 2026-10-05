<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Message;
use App\Models\Prescription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Activité de démonstration pour les patients de senegal_patients.json :
 * rendez-vous (passés et à venir), ordonnances après les consultations terminées, conversations.
 * Les patients qui ont déjà des rendez-vous sont ignorés : relancer le seeder ne crée pas de doublons.
 */
class DemoActivitySeeder extends Seeder
{
    private const REASONS = [
        'Médecine générale' => ['Fièvre et courbatures depuis 3 jours', 'Bilan de santé annuel', 'Toux persistante', 'Maux de tête fréquents', 'Douleurs abdominales', 'Renouvellement d\'ordonnance'],
        'Pédiatrie' => ['Vaccination', 'Fièvre chez l\'enfant', 'Suivi de croissance', 'Diarrhée et vomissements', 'Toux et rhume'],
        'Gynécologie' => ['Suivi de grossesse', 'Consultation de contrôle', 'Contraception', 'Douleurs pelviennes', 'Échographie de suivi'],
        'Cardiologie' => ['Contrôle de la tension artérielle', 'Palpitations', 'Essoufflement à l\'effort', 'Électrocardiogramme de suivi'],
        'Dermatologie' => ['Éruption cutanée', 'Acné', 'Taches sur la peau', 'Démangeaisons persistantes'],
        'Ophtalmologie' => ['Baisse de la vision', 'Yeux rouges et irrités', 'Contrôle de la vue', 'Renouvellement de lunettes'],
        'Chirurgie dentaire' => ['Douleur dentaire', 'Détartrage', 'Carie', 'Saignement des gencives'],
        'Psychiatrie' => ['Troubles du sommeil', 'Anxiété', 'Suivi psychologique', 'Fatigue et stress'],
        'Neurologie' => ['Migraines', 'Vertiges', 'Engourdissement des mains', 'Suivi épilepsie'],
        'ORL' => ['Douleur à l\'oreille', 'Angine à répétition', 'Sinusite', 'Baisse de l\'audition'],
        'Endocrinologie' => ['Suivi du diabète', 'Bilan thyroïdien', 'Prise de poids inexpliquée'],
        'Gastro-entérologie' => ['Brûlures d\'estomac', 'Douleurs abdominales', 'Troubles digestifs', 'Suivi hépatite'],
        'Rhumatologie' => ['Douleurs articulaires', 'Mal de dos', 'Douleurs au genou'],
        'Pneumologie' => ['Suivi asthme', 'Toux chronique', 'Gêne respiratoire'],
        'Urologie' => ['Troubles urinaires', 'Douleurs lombaires', 'Bilan prostatique'],
    ];

    private const PRESCRIPTIONS = [
        'Médecine générale' => [
            "Paracétamol 1 g : 1 comprimé 3 fois par jour pendant 5 jours.\nBoire au moins 1,5 L d'eau par jour.\nRevenir si la fièvre persiste au-delà de 3 jours.",
            "Amoxicilline 1 g : 1 comprimé matin et soir pendant 7 jours.\nParacétamol 500 mg en cas de douleur (maximum 6 par jour).",
            "Bilan sanguin : NFS, glycémie à jeun, créatinine.\nRendez-vous de contrôle avec les résultats.",
        ],
        'Pédiatrie' => [
            "Paracétamol sirop : 1 dose-poids toutes les 6 heures si fièvre.\nSels de réhydratation orale après chaque selle liquide.\nSurveiller l'hydratation de l'enfant.",
            "Amoxicilline suspension buvable : 1 dose-poids matin et soir pendant 7 jours.\nLavage du nez au sérum physiologique 3 fois par jour.",
            "Vaccination à jour. Prochain rappel dans 6 mois.\nVitamine D : 1 dose par jour.",
        ],
        'Gynécologie' => [
            "Acide folique 5 mg : 1 comprimé par jour.\nFer + vitamine C : 1 comprimé par jour au déjeuner.\nÉchographie de contrôle dans 4 semaines.",
            "Ovule antifongique : 1 le soir pendant 3 jours.\nÉviter les savons parfumés.",
            "Bilan hormonal à réaliser entre le 3e et le 5e jour du cycle.",
        ],
        'Cardiologie' => [
            "Amlodipine 5 mg : 1 comprimé le matin.\nRéduire la consommation de sel.\nContrôle de la tension dans 1 mois.",
            "Électrocardiogramme et échographie cardiaque à réaliser.\nBisoprolol 2,5 mg : 1 comprimé le matin.",
        ],
        'Dermatologie' => [
            "Crème à base d'hydrocortisone 1 % : 2 applications par jour pendant 7 jours.\nAntihistaminique : 1 comprimé le soir pendant 10 jours.",
            "Gel au peroxyde de benzoyle 5 % : 1 application le soir.\nNettoyant doux matin et soir. Protection solaire quotidienne.",
        ],
        'Ophtalmologie' => [
            "Collyre antibiotique : 1 goutte 4 fois par jour pendant 7 jours.\nNe pas porter de lentilles pendant le traitement.",
            "Correction optique prescrite : OD -1,25 / OG -1,00.\nContrôle dans 1 an.",
        ],
        'Chirurgie dentaire' => [
            "Amoxicilline 1 g : 1 comprimé matin et soir pendant 6 jours.\nIbuprofène 400 mg si douleur (maximum 3 par jour, pendant les repas).\nBain de bouche 2 fois par jour.",
            "Détartrage effectué. Brossage 2 fois par jour avec dentifrice fluoré.\nContrôle dans 6 mois.",
        ],
        'Psychiatrie' => [
            "Hygiène du sommeil : coucher à heure fixe, pas d'écran 1 h avant le coucher.\nSuivi dans 3 semaines.",
            "Séances de suivi hebdomadaires pendant 1 mois.\nExercices de respiration 10 minutes par jour.",
        ],
        'Neurologie' => [
            "Paracétamol 1 g au début de la crise (maximum 3 g par jour).\nTenir un carnet des migraines.\nIRM cérébrale à réaliser.",
            "Bilan : électroencéphalogramme.\nPoursuivre le traitement actuel sans interruption.",
        ],
        'ORL' => [
            "Amoxicilline 1 g : 1 comprimé matin et soir pendant 6 jours.\nLavages du nez au sérum physiologique.",
            "Gouttes auriculaires : 3 gouttes 2 fois par jour pendant 7 jours.\nNe pas mouiller l'oreille.",
        ],
        'Endocrinologie' => [
            "Metformine 850 mg : 1 comprimé matin et soir pendant les repas.\nHbA1c à contrôler dans 3 mois.\nActivité physique 30 minutes par jour.",
            "Bilan thyroïdien : TSH, T4 libre.\nRendez-vous avec les résultats.",
        ],
        'Gastro-entérologie' => [
            "Oméprazole 20 mg : 1 gélule le matin à jeun pendant 4 semaines.\nÉviter les repas épicés et copieux le soir.",
            "Bilan hépatique et sérologies à réaliser.\nRégime pauvre en graisses.",
        ],
        'Rhumatologie' => [
            "Ibuprofène 400 mg : 1 comprimé 3 fois par jour pendant les repas, 5 jours.\nRadiographie du genou à réaliser.\nKinésithérapie : 10 séances.",
            "Paracétamol 1 g si douleur. Exercices d'étirement quotidiens.",
        ],
        'Pneumologie' => [
            "Salbutamol en inhalation : 2 bouffées en cas de gêne respiratoire.\nCorticoïde inhalé : 1 bouffée matin et soir.\nÉviter la fumée et la poussière.",
            "Radiographie pulmonaire à réaliser. Contrôle dans 2 semaines.",
        ],
        'Urologie' => [
            "Examen cytobactériologique des urines (ECBU).\nBoire 2 L d'eau par jour.\nRendez-vous avec les résultats.",
            "Échographie rénale et vésicale à réaliser.",
        ],
    ];

    // [message du patient, réponse du médecin, éventuelle relance du patient]
    private const CONVERSATIONS = [
        ["Bonjour docteur, je voulais savoir si je peux prendre mon traitement pendant le repas ?", "Bonjour, oui, il est même conseillé de le prendre pendant le repas pour éviter les maux d'estomac.", "Merci beaucoup docteur !"],
        ["Bonjour, mes résultats d'analyse sont disponibles. Dois-je reprendre rendez-vous ?", "Bonjour, oui, prenez un rendez-vous dans la semaine pour que nous en parlions ensemble.", "D'accord, je réserve tout de suite."],
        ["Bonsoir docteur, la fièvre est revenue cette nuit malgré le traitement.", "Bonsoir, continuez le paracétamol et buvez beaucoup d'eau. Si la fièvre dépasse 39 °C ou dure plus de 48 h, venez consulter rapidement.", null],
        ["Bonjour, est-ce que je peux arrêter les comprimés maintenant que je me sens mieux ?", "Bonjour, non, il faut terminer le traitement jusqu'au bout même si vous allez mieux, sinon l'infection peut revenir.", "Compris, merci."],
        ["Bonjour docteur, j'ai oublié de vous demander combien de temps dure la convalescence.", "Bonjour, comptez une semaine de repos. Reprenez progressivement vos activités ensuite.", null],
        ["Bonjour, je dois décaler mon rendez-vous de jeudi, est-ce possible ?", "Bonjour, pas de problème. Choisissez un autre créneau disponible depuis votre espace.", "Merci docteur, c'est fait."],
        ["Bonjour docteur, mon enfant tousse encore un peu, est-ce normal ?", "Bonjour, une petite toux peut persister quelques jours après une infection. Si elle s'aggrave ou s'accompagne de fièvre, revenez me voir.", null],
    ];

    public function run()
    {
        mt_srand(2026); // données reproductibles

        $emails = collect(json_decode(file_get_contents(database_path('data/senegal_patients.json')), true))->pluck('email');
        $patients = User::with('patientProfile')->where('role', 'patient')->whereIn('email', $emails)->get()
            ->filter(fn ($patient) => !Appointment::where('patient_id', $patient->id)->exists());

        if ($patients->isEmpty()) {
            return;
        }

        $doctors = User::with('doctorProfile')->where('role', 'doctor')->get()->filter->doctorProfile->values();
        $booked = Appointment::get(['doctor_id', 'date', 'time'])
            ->map(fn ($a) => "{$a->doctor_id}|{$a->date}|" . substr($a->time, 0, 5))->flip();
        $today = Carbon::today();
        $conversationCount = 0;

        foreach ($patients as $patient) {
            $region = trim(collect(explode(',', $patient->patientProfile?->address ?? ''))->last());
            $local = $doctors->filter(fn ($d) => $d->doctorProfile->region === $region)->values();
            $seenDoctors = collect();

            $appointmentCount = mt_rand(2, 6);
            for ($i = 0; $i < $appointmentCount; $i++) {
                // 75 % des consultations avec un médecin de la région, sinon un médecin de Dakar ou d'ailleurs
                $pool = $local->isNotEmpty() && mt_rand(1, 100) <= 75 ? $local : $doctors;
                $doctor = $pool[mt_rand(0, $pool->count() - 1)];

                $slot = $this->findSlot($doctor, $today, $booked);
                if (!$slot) {
                    continue;
                }
                [$date, $time] = $slot;
                $booked["{$doctor->id}|{$date->toDateString()}|{$time}"] = true;

                $isPast = $date->lt($today);
                $roll = mt_rand(1, 100);
                $status = $isPast
                    ? ($roll <= 85 ? 'completed' : 'rejected')
                    : ($roll <= 50 ? 'accepted' : ($roll <= 90 ? 'pending' : 'rejected'));

                $specialty = $doctor->doctorProfile->specialty;
                $reasons = self::REASONS[$specialty] ?? self::REASONS['Médecine générale'];
                $createdAt = $date->copy()->subDays(mt_rand(2, 14))->setTime(mt_rand(8, 21), mt_rand(0, 59));

                $appointment = new Appointment([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'date' => $date->toDateString(),
                    'time' => $time,
                    'reason' => $reasons[mt_rand(0, count($reasons) - 1)],
                    'status' => $status,
                ]);
                $appointment->created_at = $createdAt->min(now());
                $appointment->updated_at = $isPast ? $date->copy()->setTimeFromTimeString($time) : $appointment->created_at;
                $appointment->save();

                if ($status === 'completed') {
                    $seenDoctors->push($doctor);

                    // Ordonnance pour environ 80 % des consultations terminées
                    if (mt_rand(1, 100) <= 80) {
                        $texts = self::PRESCRIPTIONS[$specialty] ?? self::PRESCRIPTIONS['Médecine générale'];
                        $prescription = new Prescription([
                            'doctor_id' => $doctor->id,
                            'patient_id' => $patient->id,
                            'description' => $texts[mt_rand(0, count($texts) - 1)],
                        ]);
                        $prescription->created_at = $prescription->updated_at =
                            $date->copy()->setTimeFromTimeString($time)->addMinutes(mt_rand(20, 45));
                        $prescription->save();
                    }
                }
            }

            // Conversation avec un médecin consulté (environ 1 patient sur 2)
            if ($seenDoctors->isNotEmpty() && mt_rand(1, 100) <= 55) {
                $this->createConversation($patient, $seenDoctors->last(), $conversationCount++);
            }
        }
    }

    /** Créneau libre dans les disponibilités du médecin, entre J-90 et J+30 */
    private function findSlot(User $doctor, Carbon $today, $booked): ?array
    {
        $availability = $doctor->doctorProfile->available_time;
        if (is_string($availability)) {
            $availability = json_decode($availability, true);
        }
        if (empty($availability)) {
            return null;
        }

        for ($try = 0; $try < 25; $try++) {
            $date = $today->copy()->addDays(mt_rand(-90, 30));
            $ranges = $availability[$date->format('l')] ?? null; // ex. "Monday" => ["09H-12H", "14H-17H"]
            if (!$ranges) {
                continue;
            }
            $range = $ranges[mt_rand(0, count($ranges) - 1)];
            if (!preg_match('/(\d{1,2})H\s*-\s*(\d{1,2})H/i', $range, $m) || (int) $m[2] <= (int) $m[1]) {
                continue;
            }
            $time = sprintf('%02d:%02d', mt_rand((int) $m[1], (int) $m[2] - 1), mt_rand(0, 1) * 30);
            if (!isset($booked["{$doctor->id}|{$date->toDateString()}|{$time}"])) {
                return [$date, $time];
            }
        }

        return null;
    }

    private function createConversation(User $patient, User $doctor, int $index): void
    {
        [$question, $answer, $followUp] = self::CONVERSATIONS[$index % count(self::CONVERSATIONS)];

        $start = Carbon::now()->subDays(mt_rand(0, 20))->setTime(mt_rand(8, 20), mt_rand(0, 59));
        $answeredAt = $start->copy()->addMinutes(mt_rand(15, 300))->min(now());
        // Les conversations récentes ont parfois une réponse pas encore lue par le patient
        $answerRead = $answeredAt->lt(now()->subDays(2)) || mt_rand(1, 100) <= 50;

        $messages = [
            [$patient->id, $doctor->id, $question, $start, true],
            [$doctor->id, $patient->id, $answer, $answeredAt, $answerRead],
        ];
        if ($followUp && $answerRead) {
            $messages[] = [$patient->id, $doctor->id, $followUp, $answeredAt->copy()->addMinutes(mt_rand(5, 120))->min(now()), mt_rand(1, 100) <= 60];
        }

        foreach ($messages as [$from, $to, $content, $at, $read]) {
            $message = new Message(['sender_id' => $from, 'receiver_id' => $to, 'content' => $content]);
            $message->created_at = $message->updated_at = $at;
            $message->read_at = $read ? $at->copy()->addMinutes(mt_rand(1, 60))->min(now()) : null;
            $message->save();
        }
    }
}
