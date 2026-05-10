-- Supprimer les anciens triggers s'ils existent pour éviter les conflits
DROP TRIGGER IF EXISTS on_petition_signature ON petition_signatures;
DROP TRIGGER IF EXISTS on_survey_vote ON survey_votes;

-- Fonction pour mettre à jour les pétitions
CREATE OR REPLACE FUNCTION update_petition_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE petitions 
    SET current_signatures = (SELECT count(*) FROM petition_signatures WHERE petition_id = NEW.petition_id)
    WHERE id = NEW.petition_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les sondages (incluant le JSONB options)
CREATE OR REPLACE FUNCTION update_survey_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE surveys 
    SET 
        total_votes = (SELECT count(*) FROM survey_votes WHERE survey_id = NEW.survey_id),
        votes_yes = (SELECT count(*) FROM survey_votes WHERE survey_id = NEW.survey_id AND option_index = 0),
        votes_no = (SELECT count(*) FROM survey_votes WHERE survey_id = NEW.survey_id AND option_index = 1),
        -- Mise à jour du JSONB pour que l'affichage frontend (opt.votes) soit correct
        options = (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'text', elem->>'text',
                    'votes', (SELECT count(*) FROM survey_votes WHERE survey_id = NEW.survey_id AND option_index = idx - 1)
                )
            )
            FROM jsonb_array_elements(options) WITH ORDINALITY AS t(elem, idx)
        )
    WHERE id = NEW.survey_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Récréer les triggers
CREATE TRIGGER on_petition_signature
AFTER INSERT ON petition_signatures
FOR EACH ROW EXECUTE FUNCTION update_petition_counts();

CREATE TRIGGER on_survey_vote
AFTER INSERT ON survey_votes
FOR EACH ROW EXECUTE FUNCTION update_survey_counts();

-- Mise à jour immédiate des données existantes pour corriger les compteurs à 0
UPDATE petitions p SET current_signatures = (SELECT count(*) FROM petition_signatures WHERE petition_id = p.id);
UPDATE surveys s SET 
    total_votes = (SELECT count(*) FROM survey_votes WHERE survey_id = s.id),
    votes_yes = (SELECT count(*) FROM survey_votes WHERE survey_id = s.id AND option_index = 0),
    votes_no = (SELECT count(*) FROM survey_votes WHERE survey_id = s.id AND option_index = 1),
    options = (
        SELECT jsonb_agg(
            jsonb_build_object(
                'text', elem->>'text',
                'votes', (SELECT count(*) FROM survey_votes WHERE survey_id = s.id AND option_index = idx - 1)
            )
        )
        FROM jsonb_array_elements(options) WITH ORDINALITY AS t(elem, idx)
    );
