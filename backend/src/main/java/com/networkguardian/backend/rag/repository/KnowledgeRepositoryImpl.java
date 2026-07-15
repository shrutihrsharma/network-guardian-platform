package com.networkguardian.backend.rag.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;

@Repository
public class KnowledgeRepositoryImpl implements KnowledgeRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public KnowledgeRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<KnowledgeDocument> search(KnowledgeQuery query) {
        Query mongoQuery = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (query == null) {
            return mongoTemplate.find(mongoQuery, KnowledgeDocument.class);
        }

        if (StringUtils.hasText(query.getVendor())) {
            criteria.add(caseInsensitiveEquals("vendor", query.getVendor()));
        }
        if (StringUtils.hasText(query.getDeviceType())) {
            criteria.add(caseInsensitiveEquals("deviceType", query.getDeviceType()));
        }
        if (StringUtils.hasText(query.getCategory())) {
            criteria.add(caseInsensitiveEquals("category", query.getCategory()));
        }
        if (query.getTags() != null && !query.getTags().isEmpty()) {
            List<Criteria> tagCriteria = query.getTags().stream()
                    .filter(StringUtils::hasText)
                    .map(tag -> Criteria.where("tags").regex("^" + Pattern.quote(tag.trim()) + "$", "i"))
                    .toList();
            if (!tagCriteria.isEmpty()) {
                criteria.add(new Criteria().orOperator(tagCriteria.toArray(Criteria[]::new)));
            }
        }
        if (query.getKeywords() != null && !query.getKeywords().isEmpty()) {
            List<Criteria> keywordCriteria = query.getKeywords().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .map(keyword -> new Criteria().orOperator(
                            Criteria.where("title").regex(Pattern.quote(keyword), "i"),
                            Criteria.where("content").regex(Pattern.quote(keyword), "i"),
                            Criteria.where("vendor").regex(Pattern.quote(keyword), "i"),
                            Criteria.where("deviceType").regex(Pattern.quote(keyword), "i")))
                    .toList();
            if (!keywordCriteria.isEmpty()) {
                criteria.add(new Criteria().orOperator(keywordCriteria.toArray(Criteria[]::new)));
            }
        }

        if (!criteria.isEmpty()) {
            mongoQuery.addCriteria(new Criteria().andOperator(criteria.toArray(Criteria[]::new)));
        }

        return mongoTemplate.find(mongoQuery, KnowledgeDocument.class);
    }

    private Criteria caseInsensitiveEquals(String field, String value) {
        return Criteria.where(field).regex("^" + Pattern.quote(value.trim()) + "$", "i");
    }
}